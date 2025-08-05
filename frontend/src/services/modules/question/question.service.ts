import { QUESTION_URL } from '@/consts/apiUrl';
import httpService from '@/services/httpService';
import {
  IQuestionForm,
  IQuestionRequest,
  ResponseGetListQuestion,
} from './interfaces/question.interface';
import { AxiosRequestConfig } from 'axios';

class questionService {
  importQuestion(body: IQuestionForm[]) {
    return httpService.post(`${QUESTION_URL}/importQuestions`, body);
  }

  getListQuestion(
    filter: IQuestionRequest,
    config: AxiosRequestConfig,
  ): Promise<ResponseGetListQuestion> {
    const queryParams = new URLSearchParams({
      PageSize: (filter?.pageSize ?? 50).toString(),
      CurrentPage: (filter?.currentPage ?? 1).toString(),
      TextSearch: filter?.textSearch || '',
    });

    if (filter?.IsMyQuestion !== undefined) {
      queryParams.append('IsMyQuestion', filter.IsMyQuestion.toString());
    }

    if (filter?.Status !== undefined) {
      queryParams.append('Status', filter.Status.toString());
    }
    if (filter?.DifficultyLevel !== undefined) {
      queryParams.append('DifficultyLevel', filter.DifficultyLevel.toString());
    }

    return httpService.get(`${QUESTION_URL}/get-list?${queryParams.toString()}`, config);
  }

  addQuestion(body: FormData) {
    return httpService.post(`${QUESTION_URL}/add`, body, {
      headers: {
        'Content-Type': 'multipart/form-data', // Đảm bảo Content-Type đúng
      },
    });
  }
}

export default new questionService();
