using API.Commons;
using API.Helper;
using API.Models;
using API.Services.Interfaces;
using API.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;

namespace API.Services
{
    public class FaceCaptureService : IFaceCaptureService
    {
        private readonly Sep490Context _context;
        private readonly IAmazonS3Service _s3Service;
        public FaceCaptureService(Sep490Context context, IAmazonS3Service s3Service)
        {
            _context = context;
            _s3Service = s3Service;
        }

        public async Task<(string, SearchResult?)> GetList(FaceCaptureSearchVM input)
        {
            var studentExam = await _context.StudentExams.Include(se => se.User).Include(x => x.Exam).AsNoTracking()
                .FirstOrDefaultAsync(se => se.StudentExamId == input.StudentExamId && se.ExamId == input.ExamId);
            if (studentExam == null) return ("Student exam not found.", null);

            var query = _context.FaceCaptures.Where(fc => fc.StudentExamId == input.StudentExamId).AsNoTracking().AsQueryable();
            if (input.LogType.HasValue)
                query = query.Where(fc => fc.LogType == (int)input.LogType.Value);

            if (!input.TextSearch.IsEmpty())
                query = query.Where(fc => fc.Description.ToLower().Contains(input.TextSearch.ToLower()));

            var totalCount = await query.CountAsync();
            var totalPage = (int)Math.Ceiling(totalCount / (double)input.PageSize);

            var captures = await query
                .OrderByDescending(fc => fc.CreatedAt)
                .Skip((input.CurrentPage - 1) * input.PageSize)
                .Take(input.PageSize)
                .Select(fc => new FaceCaptureVM.CaptureImages
                {
                    CaptureId = fc.CaptureId,
                    ImageUrl = fc.ImageUrl,
                    Description = fc.Description,
                    IsDetected = fc.IsDetected,
                    LogType = fc.LogType,
                    Emotions = fc.Emotions,
                    DominantEmotion = fc.DominantEmotion,
                    AvgArousal = fc.AvgArousal,
                    AvgValence = fc.AvgValence,
                    InferredState = fc.InferredState,
                    ErrorMessage = fc.ErrorMessage,
                    Region = fc.Region,
                    Result = fc.Result,
                    Status = fc.Status,
                    CreatedAt = fc.CreatedAt,
                    UpdatedAt = fc.UpdatedAt
                }).ToListAsync();
            if (captures.IsObjectEmpty())
                return ("No captures found for this student exam.", null);

            var result = new FaceCaptureVM
            {
                StudentExamId = studentExam.StudentExamId,
                UserId = studentExam.StudentId,
                ExamName = studentExam.Exam?.Title ?? "Unknown Exam",
                FullName = studentExam.User?.FullName ?? "",
                UserCode = studentExam.User?.UserCode ?? "",
                Captures = captures
            };
            return ("", new SearchResult
            {
                Result = result,
                TotalPage = totalPage,
                CurrentPage = input.CurrentPage,
                Total = totalCount,
                PageSize = input.PageSize,
            });
        }

        public async Task<(string, FaceCaptureVM.CaptureImages?)> GetOne(string captureId)
        {
            var capture = await _context.FaceCaptures
                .Where(fc => fc.CaptureId == captureId)
                .Select(fc => new FaceCaptureVM.CaptureImages
                {
                    CaptureId = fc.CaptureId,
                    ImageUrl = fc.ImageUrl,
                    Description = fc.Description,
                    LogType = fc.LogType,
                    IsDetected = fc.IsDetected,
                    Emotions = fc.Emotions,
                    DominantEmotion = fc.DominantEmotion,
                    AvgArousal = fc.AvgArousal,
                    AvgValence = fc.AvgValence,
                    InferredState = fc.InferredState,
                    Region = fc.Region,
                    Result = fc.Result,
                    Status = fc.Status,
                    ErrorMessage = fc.ErrorMessage,
                    CreatedAt = fc.CreatedAt,
                    UpdatedAt = fc.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (capture == null) return ("Capture not found.", null);
            return ("", capture);
        }

        public async Task<string> AddCapture(FaceCaptureRequest input)
        {
            var studentExam = await _context.StudentExams.Include(x => x.User).FirstOrDefaultAsync(se => se.StudentExamId == input.StudentExamId && se.Status == (int)StudentExamStatus.InProgress);
            if (studentExam == null) return "Student exam not found or students not in the exam process.";

            var exam = await _context.Exams.FirstOrDefaultAsync(e => e.ExamId == studentExam.ExamId);
            if (exam == null) return ("Exam not found.");

            var newCapId = Guid.NewGuid().ToString();
            string key = $"{UrlS3.Camera}{studentExam.User.UserCode}/{exam.Title}/{input.ImageCapture.FileName}";
            var uploadedUrls = await _s3Service.UploadFileAsync(key, input.ImageCapture);

            var capture = new FaceCapture
            {
                CaptureId = newCapId,
                StudentExamId = input.StudentExamId,
                ImageUrl = uploadedUrls,
                Description = input.Description,
                LogType = (int)input.LogType,
                Emotions = input.Emotions,
                DominantEmotion = input.DominantEmotion,
                AvgArousal = input.AvgArousal,
                AvgValence = input.AvgValence,
                InferredState = input.InferredState,
                Region = input.Region,
                Result = input.Result,
                Status = input.Status,
                ErrorMessage = input.ErrorMessage,
                IsDetected = input.IsDetected,
                CreatedAt = DateTime.UtcNow,
            };

            await _context.FaceCaptures.AddAsync(capture);
            await _context.SaveChangesAsync();
            return "";
        }

        public async Task<string> Delete(string captureId)
        {
            var capture = await _context.FaceCaptures.FirstOrDefaultAsync(fc => fc.CaptureId == captureId);
            if (capture == null) return "Capture not found.";

            if (!string.IsNullOrEmpty(capture.ImageUrl))
            {
                string s3Key = Helper.Common.ExtractKeyFromUrl(capture.ImageUrl);
                if (!string.IsNullOrEmpty(s3Key))
                {
                    await _s3Service.DeleteFileAsync(s3Key);
                }
            }
            _context.FaceCaptures.Remove(capture);
            await _context.SaveChangesAsync();
            return "";
        }

        public async Task<string> DeleteByStudentExamId(string studentExamId)
        {
            var captures = await _context.FaceCaptures.Where(fc => fc.StudentExamId == studentExamId).ToListAsync();
            if (captures == null) return "StudentExamId not found.";

            foreach (var capture in captures)
            {
                if (!string.IsNullOrEmpty(capture.ImageUrl))
                {
                    var s3Key = Helper.Common.ExtractKeyFromUrl(capture.ImageUrl);
                    if (!string.IsNullOrEmpty(s3Key))
                    {
                        await _s3Service.DeleteFileAsync(s3Key);
                    }
                }
            }
            _context.FaceCaptures.RemoveRange(captures);
            await _context.SaveChangesAsync();
            return "";
        }

        public async Task<(string, MemoryStream?)> DownloadAllCapturesAsZip(string studentExamId)
        {
            var captures = await _context.FaceCaptures.Where(fc => fc.StudentExamId == studentExamId).ToListAsync();
            if (captures.Count == 0)
                return ("No found any captures.", null);

            var zipStream = new MemoryStream();
            using (var zipArchive = new ZipArchive(zipStream, ZipArchiveMode.Create, leaveOpen: true))
            {
                foreach (var capture in captures)
                {
                    if (!string.IsNullOrEmpty(capture.ImageUrl))
                    {
                        var s3Key = Helper.Common.ExtractKeyFromUrl(capture.ImageUrl);
                        if (!string.IsNullOrEmpty(s3Key))
                        {
                            using var s3Stream = await _s3Service.DownloadFileAsync(s3Key);
                            var fileName = Path.GetFileName(s3Key);

                            var zipEntry = zipArchive.CreateEntry(fileName, CompressionLevel.Fastest);
                            using var entryStream = zipEntry.Open();
                            await s3Stream.CopyToAsync(entryStream);
                        }
                    }
                }
            }
            zipStream.Position = 0;
            return ("", zipStream);
        }

    }
}
