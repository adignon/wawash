import { getDeviceToken } from "@/helpler";
import axios from "axios";

axios.interceptors.request.use(async config => {
    config.baseURL = process.env.EXPO_PUBLIC_API_URL + "/api"
    config.headers["X-device-id"] = await getDeviceToken()
    return config
}, error => {
    return Promise.reject(error);
});
