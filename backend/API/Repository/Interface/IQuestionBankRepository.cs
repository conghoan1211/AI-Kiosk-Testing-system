using API.Models;

namespace API.Repository.Interface
{
    public interface IQuestionBankRepository
    {
        Task<QuestionBank?> GetWithQuestionsAsync(string questionBankId);

    }
}
