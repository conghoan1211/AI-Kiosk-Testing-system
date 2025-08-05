import httpService from '@/services/httpService';

class faceService {
  verifyFace(image: FormData) {
    return httpService.post(`https://api.2handshop.id.vn/verify-face`, image);
  }

  analyzeFace(image: FormData) {
    return httpService.post(`https://api.2handshop.id.vn/analyze`, image);
  }
}

export default new faceService();
