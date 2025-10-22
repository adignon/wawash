import { getDeviceToken } from "@/helpler";
import { useStore } from "@/store/store";
import axios from "axios";

axios.interceptors.request.use(async config => {
    const {user, accessToken}=useStore.getState()
    config.baseURL = process.env.EXPO_PUBLIC_API_URL + "/api"
    config.headers["X-device-id"] = await getDeviceToken()
    config.headers.Authorization = `Bearer ${accessToken}`
    return config
}, error => {
    return Promise.reject(error);
});
