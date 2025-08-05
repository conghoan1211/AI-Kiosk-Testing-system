import { showError } from '@/helpers/toast';
import httpService from '@/services/httpService';
import { isArray } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useEffect, useState } from 'react';
import {
  IExamActivityLogRequest,
  IListExamActivityLog,
} from '../interfaces/examactivitylog.interface';
import examactivitylogService from '../examactivitylog.service';

//* Check parse body request
const parseRequest = (filters: IExamActivityLogRequest) => {
  return cloneDeep({
    studentExamId: filters?.studentExamId || '',
    pageSize: filters?.pageSize || 5,
    currentPage: filters?.currentPage || 1,
    textSearch: filters?.textSearch || '',
  });
};

const useGetListExamActivityLog = (
  filters: IExamActivityLogRequest,
  options: {
    isTrigger?: boolean;
  } = {
    isTrigger: true,
  },
) => {
  //! State
  const { isTrigger = true } = options;

  const [data, setData] = useState<IListExamActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [hasMore] = useState(false);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [total] = useState<number>(0);
  const token = httpService.getTokenStorage();
  const [loadingMore] = useState(false);

  //! Function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextFilters = parseRequest(filters);
      httpService.attachTokenToHeader(token);
      const response = await examactivitylogService.getListExamActivityLog(nextFilters, {});
      if (isArray(response?.data?.data?.result)) {
        setData(response.data.data.result);
        setTotalPage(response.data.data.totalPage);
      } else {
        setData([]);
      }
    } catch (error: any) {
      setError(error);
      if (error?.response?.data.message === 'No found any log') {
        setData([]);
      } else {
        showError(error.message || 'An error occurred while fetching user activity logs');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    if (!isTrigger) {
      return;
    }
    fetchData();
  }, [filters, token, isTrigger, fetchData]);

  return {
    data,
    loading,
    error,
    hasMore,
    setData,
    totalPage,
    total,
    loadingMore,
  };
};

export default useGetListExamActivityLog;
