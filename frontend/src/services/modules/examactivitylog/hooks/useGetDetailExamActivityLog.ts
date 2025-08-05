import { useCallback, useEffect, useRef, useState } from "react";

import { showError } from "@/helpers/toast";
import httpService from "@/services/httpService";
import { ExamActivityLogDetail, ResponseExamActivityLogDetail } from "../interfaces/examactivitylog.interface";
import examactivitylogService from "../examactivitylog.service";
import { isEmpty } from "lodash";
import { errorHandler } from "@/helpers/errors";

const useGetDetailExamActivityLog = (
    id: string | undefined,
    options: { isTrigger?: boolean } = {
        isTrigger: true,
    },
) => {
    //! State
    const { isTrigger = true } = options;
    const signal = useRef(new AbortController());
    const [data, setData] = useState<ExamActivityLogDetail>();
    const [loading, setLoading] = useState(false);
    const [isRefetching, setRefetching] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const token = httpService.getTokenStorage();

    //! Function
    const fetch: () => Promise<ResponseExamActivityLogDetail> | undefined =
        useCallback(() => {
            if (!isTrigger) {
                return;
            }
            return new Promise((resolve, reject) => {
                (async () => {
                    try {
                        httpService.attachTokenToHeader(token);
                        const response = await examactivitylogService.getOneExamLog(id as string);
                        resolve(response);
                    } catch (error) {
                        setError(error);
                        reject(error);
                    }
                })();
            });
        }, [id, isTrigger, token]);

    const checkConditionPass = useCallback(
        (response: ResponseExamActivityLogDetail) => {
            //* Check condition of response here to set data
            if (!isEmpty(response?.data?.data)) {
                setData(response.data?.data);
            }
        },
        [],
    );

    const refetch = useCallback(async () => {
        try {
            setRefetching(true);
            signal.current = new AbortController();
            const response = await examactivitylogService.getOneExamLog(id as string);
            checkConditionPass(response);
        } catch (error: any) {
            showError(errorHandler(error));
        } finally {
            setRefetching(false);
        }
    }, [checkConditionPass, id]);

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


    return { data, loading, error, refetch, refetchWithLoading, setData, isRefetching };
};

export default useGetDetailExamActivityLog;
