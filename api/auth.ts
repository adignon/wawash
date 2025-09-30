import { handleAxiosResponseEror } from "@/helpler";
import axios from "axios";

export const otpVerify=async ({phone, changeDevice}:{phone:string, changeDevice?:boolean})=>{
    try{
        const {data}=await axios.post("/auth/access/verify",{
            phone,
            changeDevice
        })
        return data;
    }catch(e){
        throw handleAxiosResponseEror(e)
    }
}

export const otpVerifyCode=async ({phone, otp, token}:{phone:string,token:string, otp:string})=>{
    try{
        const {data}=await axios.post("/auth/access/confirm",{
            phone,
            otp,
            token
        })
        return data;
    }catch(e){
        throw handleAxiosResponseEror(e)
    }
}

export async function createUserAccount(data: {token:string, firstname:string,profileImage?:{uri:string, type:string, name:string}, lastname:string,phone:string, email:string}) {
    try {
        const formData = new FormData()
        formData.append("token", data.token)
        formData.append("lastname", data.lastname)
        formData.append("email", data.email)
        formData.append("phone", data.phone)
        formData.append("firstname", data.firstname)
      if (data.profileImage) formData.append("profileImage", data.profileImage as any);
        const { data: response } = await axios.post(`/auth/create`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response

    } catch (e) {
        throw  handleAxiosResponseEror(e) 
    }
}