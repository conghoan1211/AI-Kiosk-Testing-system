import { cloneDeep, isArray } from 'lodash';
import { BankQuestionList, IBankQuestionRequest, ResponseGetListBankQuestion } from '../interfaces/bankquestion.interface';
import bankquestionService from '../bankquestion.Service';
import { useCallback, useEffect, useRef, useState } from 'react';
import httpService from '@/services/httpService';
import { showError } from '@/helpers/toast';

const parseRequest = (filters: IBankQuestionRequest) => {
  return cloneDeep({
    pageSize: filters?.pageSize || 50,
    currentPage: filters?.currentPage || 1,
    textSearch: filters?.textSearch || '',
    IsMyQuestion: filters?.IsMyQuestion ?? true,
    filterSubject: filters?.filterSubject || '',
    status: filters?.status || 1
  });
};
const requestAPI = bankquestionService.getAllBankQuestions;
const useGetListBankQuestion = (
  filters: IBankQuestionRequest,
  options: {
    isTrigger?: boolean;
  } = {
      isTrigger: true,
    },
) => {
  const { isTrigger = true } = options;
  const signal = useRef(new AbortController());
  const [data, setData] = useState<BankQuestionList[]>([]);
  const [loading, setLoading] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const token = httpService.getTokenStorage();
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalQuestionBanks, setTotalQuestionBanks] = useState<number>(0);
  const [totalQuestionsQB, setTotalQuestionsQB] = useState<number>(0)



  const fetch = useCallback(() => {
    if (!isTrigger) {
      return Promise.resolve(null); // Return null if not triggered
    }

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const nextFilters = parseRequest(filters);
          httpService.attachTokenToHeader(token);

          const response = await requestAPI(nextFilters, {
            signal: signal.current.signal,
          });
          resolve(response);
        } catch (error) {
          setError(error);
          reject(error);
        }
      })();
    });
  }, [filters, isTrigger, token]);

  const checkConditionPass = useCallback(
    (response: ResponseGetListBankQuestion) => {
      if (isArray(response?.data?.data?.result)) {
        setTotalPage(response.data.data.totalPage || 1);
        setTotalQuestionBanks(response.data.data.totalQuestionBanks || 0);
        setTotalQuestionsQB(response.data.data.totalQuestionsQB || 0);
        setData(response.data.data.result);
      }
    },
    [],
  );

  const refetch = useCallback(async () => {
    try {
      if (signal.current) {
        signal.current.abort();
        signal.current = new AbortController();
      }

      setRefetching(true);
      const response = await fetch();
      if (response) {
        checkConditionPass(response as ResponseGetListBankQuestion);
      }
      setRefetching(false);
    } catch (error: any) {
      if (!error.isCanceled) {
        showError(error);
      }
    }
  }, [fetch, checkConditionPass]);

  useEffect(() => {
    signal.current = new AbortController();

    const fetchAPI = async () => {
      try {
        setLoading(true);
        const response = await fetch();
        if (response) {
          checkConditionPass(response as ResponseGetListBankQuestion);
        }
      } catch (error) {
        showError(error);
      } finally {
        setLoading(false);
      }
    };

    if (isTrigger) {
      fetchAPI();
    }

    return () => {
      if (signal.current) {
        signal.current.abort();
      }
    };
  }, [isTrigger, fetch, checkConditionPass]);

  // const fetchData = useCallback(async () => {
  //   if (!isTrigger) {
  //     return;
  //   }
  //   try {
  //     setLoading(true);
  //     const nextFilters = parseRequest(filters);
  //     httpService.attachTokenToHeader(token);
  //     const response = await bankquestionService.getAllBankQuestions(nextFilters, {});
  //     if (isArray(response?.data?.data?.result)) {
  //       setData(response.data.data.result);
  //       setTotalPage(response.data.data.totalPage);
  //       setTotalQuestionBanks(response.data.data.totalQuestionBanks);
  //     }
  //   } catch (error) {
  //     setError(error);
  //     showError(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [filters, token, isTrigger]);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  return { data, loading, error, refetch, totalPage, totalQuestionBanks, refetching, totalQuestionsQB };
};

export default useGetListBankQuestion;
