// src/api/axios.d.ts  
import axios from 'axios';

declare module '@/api/axios' {
    export default axios.Instance;
}