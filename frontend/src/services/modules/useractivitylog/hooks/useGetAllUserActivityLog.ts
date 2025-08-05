import { showError } from '@/helpers/toast';
import httpService from '@/services/httpService';
import { isArray } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useEffect, useState } from 'react';
import { IListUserActivityLog, IUserActivityLogRequest } from '../interfaces/useractivitylog.interface';
import useractivitylogService from '../useractivitylog.service';

//* Check parse body request
const parseRequest = (filters: IUserActivityLogRequest) => {
    return cloneDeep({
        FromDate: filters.FromDate,
        ToDate: filters.ToDate,
        RoleEnum: filters.RoleEnum,
        pageSize: filters?.pageSize || 5,
        currentPage: filters?.currentPage || 1,
        textSearch: filters?.textSearch || '',
    });
};

const useGetAllUserActivityLog = (
    filters: IUserActivityLogRequest,
    options: {
        isTrigger?: boolean;
    } = {
            isTrigger: true,
        },
) => {
    //! State
    const { isTrigger = true } = options;

    const [data, setData] = useState<IListUserActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [hasMore,] = useState(false);
    const [totalPage,] = useState<number>(1);
    const [total,] = useState<number>(0);
    const token = httpService.getTokenStorage();
    const [loadingMore,] = useState(false);

    //! Function
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            const nextFilters = parseRequest(filters);
            httpService.attachTokenToHeader(token);
            const response = await useractivitylogService.getUserActivityLog(nextFilters, {});
            if (isArray(response?.data?.data?.result)) {
                setData(response.data.data.result);
            } else {
                setData([]); // Fallback for non-array response
            }
        } catch (error: any) {
            setError(error);
            // console.log(error);
            if (error?.response?.data.message === "No found any log") {
                setData([]); // Clear data if no logs found
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
        fetchData
    };
};

export default useGetAllUserActivityLog;
