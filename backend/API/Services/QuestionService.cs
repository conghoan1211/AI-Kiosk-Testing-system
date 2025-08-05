using System.Linq;
using System.Text.Json;
using API.Commons;
using API.Helper;
using API.Models;
using API.Services.Interfaces;
using API.ViewModels;
using API.ViewModels.Token;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace API.Services
{

    public class QuestionService : IQuestionService
    {
        private readonly Sep490Context _context;

        public QuestionService(Sep490Context context)
        {
            _context = context;
        }


        //Import questions
        public async Task<(bool Success, string Message)> ImportListQuestionAsync(List<AddQuestionRequest> listQs, string userId)
        {
            if (listQs == null || !listQs.Any())
                return (false, "The question list is empty.");

            var userExist = await _context.Users
            .Include(u => u.UserRoles)
               .AnyAsync(u => u.UserId == userId && u.UserRoles.Any(r =>
                   r.RoleId == (int)RoleEnum.Lecture || r.RoleId == (int)RoleEnum.Admin));
            if (!userExist)
                return (false, "You do not have permission to perform this action.");

            var questionsToAdd = new List<Question>();
            var errors = new List<string>();
            int successCount = 0;

            foreach (var req in listQs)
            {
                if (string.IsNullOrWhiteSpace(req.Content) || req.Point <= 0 || req.Point > 10)
                {
                    errors.Add($"[Question: {req.Content}] Invalid content or point.");
                    continue;
                }

                if (req.Type < 0 || req.Type > 1 || req.DifficultLevel < 1 || req.DifficultLevel > 4)
                {
                    errors.Add($"[Question: {req.Content}] Invalid type or difficulty.");
                    continue;
                }

                // Validate related data
                var bank = await _context.QuestionBanks.FirstOrDefaultAsync(qb => qb.QuestionBankId.ToLower() == req.QuestionBankId.ToLower());
                //var subject = await _context.Subjects.FirstOrDefaultAsync(sj => sj.SubjectId.ToLower() == req.SubjectId.ToLower());

                if (bank == null)
                {
                    errors.Add($"[Question: {req.Content}] Question bank not found.");
                    continue;
                }

                if (bank.SubjectId == null)
                {
                    errors.Add($"[Question: {req.Content}] Subject not found.");
                    continue;
                }

                switch (req.Type)
                {
                    case 0: // Essay
                        req.Options = new List<string>();
                        if (string.IsNullOrWhiteSpace(req.CorrectAnswer))
                        {
                            errors.Add($"[Question: {req.Content}] Essay must have a sample answer.");
                            continue;
                        }
                        break;

                    case 1: // Multiple choice
                        if (req.Options == null || req.Options.Count < 2)
                        {
                            errors.Add($"[Question: {req.Content}] Multiple choice must have at least 2 options.");
                            continue;
                        }

                        var correctAns = req.CorrectAnswer?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(ans => ans.Trim())
                            .Where(ans => !string.IsNullOrWhiteSpace(ans))
                            .Distinct(StringComparer.OrdinalIgnoreCase)
                            .ToList() ?? new List<string>();

                        var invalidAns = correctAns
                            .Where(ans => !req.Options.Any(opt => string.Equals(opt, ans, StringComparison.OrdinalIgnoreCase)))
                            .ToList();

                        if (invalidAns.Any())
                        {
                            errors.Add($"[Question: {req.Content}] Invalid correct answers: {string.Join(", ", invalidAns)}");
                            continue;
                        }

                        req.CorrectAnswer = string.Join(",", correctAns);
                        break;

                    //case 2: // True/False
                    //    req.Options = new List<string> { "True", "False", "Not Given" };
                    //    if (!req.Options.Contains(req.CorrectAnswer?.Trim()))
                    //    {
                    //        errors.Add($"[Question: {req.Content}] Correct answer must be True, False or Not Given.");
                    //        continue;
                    //    }
                    //    break;

                    //case 3: // Fill in the blank
                    //    req.Options = new List<string>();
                    //    if (string.IsNullOrWhiteSpace(req.CorrectAnswer))
                    //    {
                    //        errors.Add($"[Question: {req.Content}] Fill in the blank must have a correct answer.");
                    //        continue;
                    //    }
                    //    break;
                }

                var question = new Question
                {
                    QuestionId = Guid.NewGuid().ToString(),
                    SubjectId = bank.SubjectId,
                    QuestionBankId = req.QuestionBankId,
                    Content = req.Content.Trim(),
                    Type = req.Type,
                    DifficultLevel = req.DifficultLevel,
                    Point = req.Point,
                    Options = JsonConvert.SerializeObject(req.Options ?? new List<string>()),
                    CorrectAnswer = req.CorrectAnswer.Trim(),
                    Explanation = req.Explanation?.Trim() ?? "",
                    ObjectFile = req.ObjectFile,
                    Status = 1,
                    CreateUser = userId,
                    UpdateUser = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                questionsToAdd.Add(question);
                successCount++;
            }

            if (questionsToAdd.Any())
            {
                await _context.Questions.AddRangeAsync(questionsToAdd);
                await _context.SaveChangesAsync();
            }

            var summary = $"Imported {successCount} question(s) successfully. Failed: {errors.Count}.";

            if (errors.Any())
            {
                var errorDetails = string.Join("\n", errors.Take(5)); // Show up to 5
                return (false, summary + "\n" + errorDetails);
            }

            return (true, summary);
        }

        //Add Question
        public async Task<(bool Success, string Message)> AddQuestionAsync(AddQuestionRequest req, string userId)
        {
            // Validate user permission
            var userExist = await _context.Users
           .Include(u => u.UserRoles)
               .AnyAsync(u => u.UserId == userId && u.UserRoles.Any(r =>
                   r.RoleId == (int)RoleEnum.Lecture || r.RoleId == (int)RoleEnum.Admin));
            if (!userExist) return (false, "The user is not a lecturer or admin and does not have permission to add questions.");

            // Validate question bank
            var bank = await _context.QuestionBanks
                .FirstOrDefaultAsync(qb => qb.QuestionBankId.ToLower() == req.QuestionBankId.ToLower());
            if (bank == null)
                return (false, "Question bank not found.");

            // Validate subject
            //var subject = await _context.Subjects
            //    .FirstOrDefaultAsync(sj => sj.SubjectId.ToLower() == req.SubjectId.ToLower());
            var subjectExists = await _context.Subjects
            .AnyAsync(s => s.SubjectId.ToLower() == bank.SubjectId.ToLower());

            if (!subjectExists)
                return (false, "Subject not found.");

            // Validate common fields
            if (string.IsNullOrWhiteSpace(req.Content) || req.Point <= 0 || req.Point  > 10)
                return (false, "Content and point must be provided. Point must be > 0 and <= 10.");

            if (req.Type < 0 || req.Type > 1)
                //return (false, "Invalid question type. (0: Essay, 1: MultipleChoice, 2: TrueFalse, 3: FillInTheBlank)");
                return (false, "Invalid question type. (0: Essay, 1: MultipleChoice)");


            if (req.DifficultLevel < 1 || req.DifficultLevel > 4)
                return (false, "Difficulty must be a value between 1 and 4. (1: Easy, 2: Medium, 3: Hard, 4: VeryHard)");

            // Type-specific validation
            switch (req.Type)
            {
                case 0: // Essay
                    req.Options = new List<string>();
                    if (string.IsNullOrWhiteSpace(req.CorrectAnswer))
                        return (false, "Essay must have a sample correct answer.");
                    break;

                case 1: // MultipleChoice
                    
                        if (req.Options == null || req.Options.Count < 2)
                            return (false, "Multiple choice must have at least 2 options.");

                        if (string.IsNullOrWhiteSpace(req.CorrectAnswer))
                            return (false, "Correct answer is required.");

                        var correctAnswers = req.CorrectAnswer
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(ans => ans.Trim())
                            .Where(ans => !string.IsNullOrWhiteSpace(ans))
                            .Distinct(StringComparer.OrdinalIgnoreCase)
                            .ToList();

                        var invalidAnswers = correctAnswers
                            .Where(ans => !req.Options.Any(opt => string.Equals(opt, ans, StringComparison.OrdinalIgnoreCase)))
                            .ToList();

                        if (invalidAnswers.Any())
                            return (false, $"Correct answer(s) [{string.Join(", ", invalidAnswers)}] not found in options.");

                        // Reassign the normalized string
                        req.CorrectAnswer = string.Join(",", correctAnswers);
                        break;

                //case 2: // TrueFalse
                //    req.Options = new List<string> { "True", "False", "Not Given" };
                //    if (!req.Options.Contains(req.CorrectAnswer.Trim()))
                //        return (false, "Correct answer must be one of the options (True, False, Not Given).");
                //    break;

                //case 3: // FillInTheBlank
                //    req.Options = new List<string>();
                //    if (string.IsNullOrWhiteSpace(req.CorrectAnswer))
                //        return (false, "Fill in the blank must have a correct answer.");
                //    break;
            }

            var newQuestion = new Question
            {
                QuestionId = Guid.NewGuid().ToString(),
                SubjectId = bank.SubjectId,
                QuestionBankId = req.QuestionBankId,
                Content = req.Content.Trim(),
                Type = req.Type,
                DifficultLevel = req.DifficultLevel,
                Point = req.Point,
                Options = JsonConvert.SerializeObject(req.Options),
                CorrectAnswer = req.CorrectAnswer.Trim(),
                Explanation = req.Explanation?.Trim() ?? "",
                ObjectFile = req.ObjectFile,
                Status = 1,
                CreateUser = userId,
                UpdateUser = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                _context.Questions.Add(newQuestion);
                await _context.SaveChangesAsync();
                return (true, "Question has been created successfully.");
            }
            catch (DbUpdateException)
            {
                return (false, "Database error occurred while saving the question.");
            }
        }

        //edit
        public async Task<(bool Success, string Message)> EditQuestionAsync(EditQuestionRequest req, string userId)
        {
            // Validate user permission
            var userExist = await _context.Users
           .Include(u => u.UserRoles)
               .AnyAsync(u => u.UserId == userId && u.UserRoles.Any(r =>
                   r.RoleId == (int)RoleEnum.Lecture || r.RoleId == (int)RoleEnum.Admin));
            if (!userExist)
                return (false, "You do not have permission to perform this action.");

            // Validate question exists
            var question = await _context.Questions
                .Include(q => q.QuestionBank)
                .FirstOrDefaultAsync(q => q.QuestionId == req.QuestionId);
            if (question == null)
                return (false, "Question not found.");

            // Validate subject and bank
            var bank = await _context.QuestionBanks
                .FirstOrDefaultAsync(qb => qb.QuestionBankId.ToLower() == req.QuestionBankId.ToLower());
            if (bank == null)
                return (false, "Question bank not found.");

            var subject = await _context.Subjects
                .FirstOrDefaultAsync(sj => sj.SubjectId.ToLower() == bank.SubjectId.ToLower());
            if (subject == null)
                return (false, "Subject not found.");

            // Validate base fields
            if (string.IsNullOrWhiteSpace(req.Content) || req.Point <= 0 || req.Point > 10)
                return (false, "Content and point must be provided. Point must be > 0 and <= 10.");

            if (req.Type < 0 || req.Type > 1)
                //return (false, "Invalid question type. (0: Essay, 1: MultipleChoice, 2: TrueFalse, 3: FillInTheBlank)");
                return (false, "Invalid question type. (0: Essay, 1: MultipleChoice)");

            if (req.DifficultLevel < 1 || req.DifficultLevel > 4)
                return (false, "Difficulty must be a value between 1 and 4. (1: Easy, 2: Medium, 3: Hard, 4: VeryHard)");

            // Validate based on type
            switch (req.Type)
            {
                case 0: // Essay
                    req.Options = new List<string>();
                    if (string.IsNullOrWhiteSpace(req.CorrectAnswer))
                        return (false, "Essay must have a sample correct answer.");
                    break;

                case 1: // MultipleChoice
                    if (req.Options == null || req.Options.Count < 2)
                        return (false, "Multiple choice must have at least 2 options.");

                    if (string.IsNullOrWhiteSpace(req.CorrectAnswer))
                        return (false, "Correct answer is required.");

                    var correctAnswers = req.CorrectAnswer
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(ans => ans.Trim())
                        .Where(ans => !string.IsNullOrWhiteSpace(ans))
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList();

                    var invalidAnswers = correctAnswers
                        .Where(ans => !req.Options.Any(opt => string.Equals(opt, ans, StringComparison.OrdinalIgnoreCase)))
                        .ToList();

                    if (invalidAnswers.Any())
                        return (false, $"Correct answer(s) [{string.Join(", ", invalidAnswers)}] not found in options.");

                    req.CorrectAnswer = string.Join(",", correctAnswers);
                    break;

                //case 2: // TrueFalse
                //    req.Options = new List<string> { "True", "False", "Not Given" };
                //    if (!req.Options.Any(opt => string.Equals(opt, req.CorrectAnswer?.Trim(), StringComparison.OrdinalIgnoreCase)))
                //        return (false, "Correct answer must be one of the options (True, False, Not Given).");
                //    break;

                //case 3: // FillInTheBlank
                //    req.Options = new List<string>();
                //    if (string.IsNullOrWhiteSpace(req.CorrectAnswer))
                //        return (false, "Fill in the blank must have a correct answer.");
                //    break;
            }

            try
            {
                question.SubjectId = bank.SubjectId;
                question.QuestionBankId = req.QuestionBankId;
                question.Content = req.Content.Trim();
                question.Type = req.Type;
                question.DifficultLevel = req.DifficultLevel;
                question.Point = req.Point;
                question.Options = JsonConvert.SerializeObject(req.Options);
                question.CorrectAnswer = req.CorrectAnswer.Trim();
                question.Explanation = req.Explanation?.Trim() ?? "";
                question.ObjectFile = req.ObjectFile;
                question.UpdateUser = !string.IsNullOrEmpty(req.CreateUserId) ? req.CreateUserId : userId;
                question.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return (true, "Question has been updated successfully.");
            }
            catch (DbUpdateException)
            {
                return (false, "Database error occurred while saving the question.");
            }
        }

        //toggle
        public async Task<(bool Success, string Message)> ToggleStatusAsync(ToggleQuestionStatusRequest req, string userId)
        {
            var userExist = await _context.Users
           .Include(u => u.UserRoles)
               .AnyAsync(u => u.UserId == userId && u.UserRoles.Any(r =>
                   r.RoleId == (int)RoleEnum.Lecture || r.RoleId == (int)RoleEnum.Admin));
            if (!userExist)
                return (false, "You do not have permission to perform this action.");

            var question = await _context.Questions
                .Include(q => q.QuestionBank)
                .FirstOrDefaultAsync(q => q.QuestionId == req.QuestionId);

            if (question == null)
                return (false, "Question not found.");

            try
            {
                var isCurrentlyActive = question.Status == 1;
                question.Status = isCurrentlyActive ? 0 : 1;
                question.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var action = isCurrentlyActive ? "deactivated" : "activated";
                return (true, $"Question has been {action} successfully.");
            }
            catch (Exception ex)
            {
                return (false, "Database error occurred while updating question status.");
            }
        }

        // Delete question
        public async Task<(bool Success, string Message)> DeleteQuestionAsync(string questionBankId, string questionId, string userId)
        {
            // Validate user permission
            var userExist = await _context.Users
           .Include(u => u.UserRoles)
               .AnyAsync(u => u.UserId == userId && u.UserRoles.Any(r =>
                   r.RoleId == (int)RoleEnum.Lecture || r.RoleId == (int)RoleEnum.Admin));
            if (!userExist)
                return (false, "You do not have permission to perform this action.");
            // Validate question bank
            var bank = await _context.QuestionBanks
                .FirstOrDefaultAsync(qb => qb.QuestionBankId.ToLower() == questionBankId.ToLower());
            if (bank == null)
                return (false, "Question bank not found or not match with question.");
            // Validate question exists
            var question = await _context.Questions
                .FirstOrDefaultAsync(q => q.QuestionId == questionId && q.QuestionBankId.ToLower() == questionBankId.ToLower());
            if (question == null)
                return (false, "Question not found or not match with question bank.");
            try
            {
                _context.Questions.Remove(question);
                await _context.SaveChangesAsync();
                return (true, "Question has been deleted successfully.");
            }
            catch (DbUpdateException ex)
            {
                return (false, "Database error occurred while deleting the question.");
            }
        }

        // Get list question
        public async Task<(bool Success, string Message, QuestionListResponse)> GetListQuestionAsync(QuestionRequestVM request, string userId)
        {

            var userExist = await _context.Users
           .Include(u => u.UserRoles)
               .AnyAsync(u => u.UserId == userId && u.UserRoles.Any(r =>
                   r.RoleId == (int)RoleEnum.Lecture || r.RoleId == (int)RoleEnum.Admin));
            if (!userExist)
                return (false, "You do not have permission to perform this action.", new QuestionListResponse());

            // Build query
            var query = _context.Questions
                .Include(q => q.Subject)
                .Include(q => q.QuestionBank)
                .AsQueryable();
            if (!string.IsNullOrEmpty(request.TextSearch))
            {
                var TextSearch = request.TextSearch.ToLower();
                query = query.Where(qb => qb.Content.ToLower().Contains(TextSearch) ||
                     (qb.Subject != null && qb.Subject.SubjectName.ToLower().Contains(TextSearch)));
            }

            if (request.Status.HasValue)
                query = query.Where(qb => qb.Status == (int)request.Status.Value);

            if (request.IsMyQuestion.HasValue && request.IsMyQuestion == true)
                query = query.Where(qb => qb.CreateUser == userId);

            if (request.DifficultyLevel.HasValue)
                query = query.Where(qb => qb.DifficultLevel == (int)request.DifficultyLevel.Value);
            var totalCount = await query.CountAsync();
            var totalPage = (int)Math.Ceiling(totalCount / (double)request.PageSize);
            var data = await query
                .OrderByDescending(q => q.CreatedAt)
                .Skip((request.CurrentPage - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(q => new QuestionListVM
                {
                    QuestionId = q.QuestionId,
                    SubjectId = q.SubjectId,
                    SubjectName = q.Subject.SubjectName,
                    QuestionBankId = q.QuestionBankId,
                    QuestionBankName = q.QuestionBank.Title,
                    Content = q.Content,
                    Type = q.Type,
                    DifficultLevel = q.DifficultLevel,
                    Point = q.Point,
                    Options = JsonConvert.DeserializeObject<List<string>>(q.Options),
                    CorrectAnswer = q.CorrectAnswer,
                    Explanation = q.Explanation,
                    ObjectFile = q.ObjectFile,
                    Status = q.Status,
                    CreatorId = q.CreateUser
                })
                .ToListAsync();

            if (data.IsObjectEmpty()) return (false, "No found any question", new QuestionListResponse());

            return (true, "Successfully retrieved question list.", new QuestionListResponse
            {
                TotalQuestions = totalCount,
                Result = data,
                TotalPage = totalPage,
                CurrentPage = request.CurrentPage,
                PageSize = request.PageSize
            });
        }

    }
}
