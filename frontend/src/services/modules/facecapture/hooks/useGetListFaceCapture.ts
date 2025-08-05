import cachedKeys from '@/consts/cachedKeys';
import { showError } from '@/helpers/toast';
import httpService from '@/services/httpService';
import { useSave } from '@/stores/useStores';
import { isArray } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useEffect, useRef, useState } from 'react';
import faceCaptureService from '../facecapture.srvice';
import {
  Capture,
  IFaceCaptureRequest,
  ResponseFaceCapture,
} from '../interfaces/facecapture.interface';

const parseRequest = (filters: IFaceCaptureRequest) => {
  return cloneDeep({
    PageSize: filters?.PageSize || 50,
    CurrentPage: filters?.CurrentPage || 1,
    TextSearch: filters?.TextSearch || '',
    StudentExamId: filters?.StudentExamId || '',
    ExamId: filters?.ExamId || '',
    LogType: filters?.LogType || '',
  });
};

const requestAPI = faceCaptureService.getListFaceCapture;

const useGetListFaceCapture = (
  filters: IFaceCaptureRequest,
  options: {
    isTrigger?: boolean;
    refetchKey?: string;
    saveData?: boolean;
    isLoadmore?: boolean;
  } = {
    isTrigger: true,
    refetchKey: '',
    saveData: true,
    isLoadmore: false,
  },
) => {
  const { isTrigger = true, refetchKey = '', saveData = true } = options;
  const signal = useRef(new AbortController());
  const save = useSave();
  const [data, setData] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const token = httpService.getTokenStorage();
  const [loadingMore, setLoadingMore] = useState(false);

  const fetch = useCallback(() => {
    if (!isTrigger) {
      return Promise.resolve(null);
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
        } catch (error: any) {
          if (error.name !== 'CanceledError') {
            setError(error);
            setData([]);
          }
          reject(error);
        }
      })();
    });
  }, [filters, isTrigger, token]);

  const checkConditionPass = useCallback(
    (response: ResponseFaceCapture, options: { isLoadmore?: boolean } = {}) => {
      const { isLoadmore } = options;

      if (saveData) {
        setTotalPage(response?.data?.data?.totalPage || 1);
        setTotal(response?.data?.data?.total || 0);
        save(cachedKeys.totalPageFaceCaptureCount, response?.data?.data.totalPage || 1);
        save(cachedKeys.totalFaceCaptureCount, response?.data?.data.total || 0);
        save(cachedKeys.dataFaceCapture, response?.data?.data?.result?.captures || []);
      }

      if (isArray(response?.data?.data?.result?.captures)) {
        if (isLoadmore) {
          setData((prev) => {
            if (filters.CurrentPage === 1) {
              return response?.data?.data?.result?.captures || [];
            }
            let nextPages = cloneDeep(prev);
            nextPages = [...(nextPages || []), ...(response?.data?.data?.result?.captures || [])];
            return nextPages;
          });
        } else {
          setData(response?.data?.data?.result?.captures || []);
        }
        setHasMore(response?.data?.data?.currentPage < response?.data?.data?.totalPage);
      }
    },
    [saveData, save, filters.CurrentPage],
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
        checkConditionPass(response as ResponseFaceCapture);
      }
      setRefetching(false);
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        console.error('Error refetching face capture data:', error);
        showError(error);
      }
    }
  }, [fetch, checkConditionPass]);

  useEffect(() => {
    save(refetchKey, refetch);
  }, [save, refetchKey, refetch]);

  useEffect(() => {
    signal.current = new AbortController();

    const fetchAPI = async () => {
      try {
        setLoading(true);
        const response = await fetch();
        if (response) {
          checkConditionPass(response as ResponseFaceCapture);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching face capture data:', error);
          showError(error);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchMore = async () => {
      try {
        setLoadingMore(true);
        const response = await fetch();
        if (response) {
          checkConditionPass(response as ResponseFaceCapture, { isLoadmore: true });
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching more face capture data:', error);
          showError(error);
        }
      } finally {
        setLoadingMore(false);
      }
    };

    if (filters.CurrentPage !== undefined && filters.CurrentPage <= 1) {
      fetchAPI();
    } else {
      fetchMore();
    }

    return () => {
      if (signal.current) {
        signal.current.abort();
      }
    };
  }, [isTrigger, fetch, checkConditionPass, filters.CurrentPage]);

  return {
    data,
    loading,
    error,
    refetch,
    refetching,
    hasMore,
    setData,
    totalPage,
    total,
    loadingMore,
  };
};

export default useGetListFaceCapture;
