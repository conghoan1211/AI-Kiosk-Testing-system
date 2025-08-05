using API.Repository;
using API.ViewModels;

namespace API.Validators
{
    public class AddExamValidator
    {
        public static async Task<(bool, string)> ValidateAsync(AddExamRequest request, IUnitOfWork unitOfWork)
        {
            if (request.EndTime <= request.StartTime)
                return (false, "EndTime must be later than StartTime.");

            if (!await unitOfWork.Rooms.ExistsAsync(request.RoomId))
                return (false, "Selected room does not exist.");

            if (request.QuestionIds?.Count < 2)
                return (false, "At least two questions are required.");

            if (request.QuestionIds.Distinct().Count() != request.QuestionIds.Count)
                return (false, "Duplicate QuestionIds are not allowed.");

            return (true, string.Empty);
        }
    }
}
