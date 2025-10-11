import { getDeviceToken } from "@/helpler";
import { useStore } from "@/store/store";
import axios from "axios";

axios.interceptors.request.use(async config => {
    config.baseURL = process.env.EXPO_PUBLIC_API_URL + "/api"
    config.headers["X-device-id"] = await getDeviceToken()
    config.headers.Authorization = `Bearer ${useStore.getState().accessToken}`
    return config
}, error => {
    return Promise.reject(error);
});
