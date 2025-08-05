import { showError } from "@/helpers/toast";
import httpService from "@/services/httpService";
import { useCallback, useEffect, useState } from "react";
import { Datum } from "../interfaces/role.interface";
import authorizeService from "../role.Service";

const useGetListRoles = () => {
  //!State
  const [data, setData] = useState<Datum[]>([]);
  const [loading, setLoading] = useState(false);
  const token = httpService.getTokenStorage();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      httpService.attachTokenToHeader(token);
      const response = await authorizeService.getListRoles();
      setData(response.data.data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [token, fetchData]);

  //!Render
  return {
    data,
    loading,
    fetchData,
  };
};

export default useGetListRoles;
