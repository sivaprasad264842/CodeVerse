import axios from "axios";

export const executeCode = async (payload) => {
    const res = await axios.post("hhtp://execution:5000/execute", payload);
    return res.data;
};