import { handleAxiosResponseEror } from "@/helpler";
import axios from "axios";

export async function getPackages() {
    try {
        const { data } = await axios.get("/packages")
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}


export async function saveAdress(requestData:any) {
    try {
        const { data } = await axios.post("/address",requestData)
        return data
    } catch (e) {
        throw handleAxiosResponseEror(e)
    }
}