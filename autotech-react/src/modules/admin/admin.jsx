import { useEffect } from "react"

export default function admin() {
  useEffect(() =>{
    const URL = "https://localhost:7192/api/Rols";
    const ConsumirApi = async() => {
      try {
        const response = await fetch(URL);
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.log(error)
      }
    };

    ConsumirApi();
  }, []);
  return null
}