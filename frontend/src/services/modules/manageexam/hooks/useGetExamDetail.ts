import { useSave } from '@/stores/useStores';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

import { errorHandler } from '@/helpers/errors';
import { showError } from '@/helpers/toast';
import httpService from '@/services/httpService';
import { ExamDetail, ResponseGetDetailExam } from '../interfaces/manageExam.interface';
import manageExamService from '../manageExam.service';

/**
 * Please check:
 * - fetch()
 * - refetch()
 * - checkConditionPass()
 */
const useGetExamDetail = (
  id: string | undefined,
  options: { isTrigger?: boolean; cachedKey?: string } = {
    isTrigger: true,
    cachedKey: '',
  },
) => {
  //! State
  const signal = useRef(new AbortController());
  const { isTrigger = true, cachedKey = '' } = options;

  const save = useSave();
  const [data, setData] = useState<ExamDetail>();
  const [isLoading, setLoading] = useState(false);
  const [isRefetching, setRefetching] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const token = httpService.getTokenStorage();

  //! Function
  const fetch: () => Promise<ResponseGetDetailExam> | undefined = useCallback(() => {
    if (!isTrigger) {
      return;
    }

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          httpService.attachTokenToHeader(token);
          const response = await manageExamService.getExamDetail(id as string);
          resolve(response);
        } catch (error) {
          setError(error);
          reject(error);
        }
      })();
    });
  }, [id, isTrigger, token]);

  const checkConditionPass = useCallback(
    (response: ResponseGetDetailExam) => {
      //* Check condition of response here to set data
      if (!isEmpty(response?.data?.data)) {
        setData(response.data?.data);
        save('detailUser', response.data?.data);
      }
    },
    [save],
  );

  //* Refetch implicity (without changing loading state)
  const refetch = useCallback(async () => {
    try {
      setRefetching(true);
      signal.current = new AbortController();
      const response = await manageExamService.getExamDetail(id as string);
      checkConditionPass(response);
    } catch (error: any) {
      showError(errorHandler(error));
    } finally {
      setRefetching(false);
    }
  }, [checkConditionPass, id]);

  useEffect(() => {
    if (cachedKey) {
      save(cachedKey, { refetch, data, isLoading, isRefetching });
    }
  }, [save, cachedKey, refetch, data, isLoading, isRefetching]);

  //* Refetch with changing loading state
  const refetchWithLoading = useCallback(
    async (shouldSetData: boolean) => {
      try {
        setLoading(true);
        signal.current = new AbortController();
        const response = await fetch();
        if (shouldSetData && response) {
          checkConditionPass(response);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [fetch, checkConditionPass],
  );

  useEffect(() => {
    let shouldSetData = true;
    signal.current = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const response = await fetch();
        if (shouldSetData && response) {
          checkConditionPass(response);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      shouldSetData = false;
      signal.current.abort();
    };
  }, [fetch, checkConditionPass]);

  return {
    data,
    isLoading,
    error,
    refetch,
    refetchWithLoading,
    isRefetching,
    setData,
  };
};

export default useGetExamDetail;
