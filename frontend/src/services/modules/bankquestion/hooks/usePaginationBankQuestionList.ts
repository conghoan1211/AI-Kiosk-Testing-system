import { cloneDeep, isArray } from 'lodash';
import { BankQuestionData, IBankQuestionRequest } from '../interfaces/bankquestion.interface';
import bankquestionService from '../bankquestion.Service';
import { useCallback, useEffect, useState } from 'react';
import httpService from '@/services/httpService';
import { showError } from '@/helpers/toast';

const parseRequest = (filters: IBankQuestionRequest) => {
  return cloneDeep({
    pageSize: filters?.pageSize || 50,
    currentPage: filters?.currentPage || 1,
    textSearch: filters?.textSearch || '',
    IsMyQuestion: filters?.IsMyQuestion || false,
  });
};

const usePaginationBankQuestionList = (
  filters: IBankQuestionRequest,
  options: {
    isTrigger?: boolean;
  } = {
    isTrigger: true,
  },
) => {
  const { isTrigger = true } = options;

  const [data, setData] = useState<BankQuestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const token = httpService.getTokenStorage();

  const fetchData = useCallback(async () => {
    if (!isTrigger) {
      return;
    }
    try {
      setLoading(true);
      const nextFilters = parseRequest(filters);
      httpService.attachTokenToHeader(token);
      const response = await bankquestionService.getAllBankQuestions(nextFilters, {});

      if (isArray(response?.data?.data)) {
        setData(response.data.data);
      }
    } catch (error) {
      setError(error);
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [filters, token, isTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default usePaginationBankQuestionList;
