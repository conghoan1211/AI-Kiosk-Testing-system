import { POSITION_URL } from "@/consts/apiUrl";
import httpService from "@/services/httpService";

class positionService {
  getListPosition(departmentId: string) {
    return httpService.get(`${POSITION_URL}?departmentId=${departmentId}`);
  }
}

export default new positionService();
