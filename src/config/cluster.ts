import {Cluster}  from "puppeteer-cluster"
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export let cluster:Cluster;


puppeteer.use(StealthPlugin());
// init cluster of puppteeer
export const initCluster=async () =>{

    console.log("🔵 Inicializando Puppeteer Cluster...");

    try{
        cluster= await Cluster.launch({

            concurrency:Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency:5,
            puppeteer,
            timeout:120000,
            puppeteerOptions:{
             headless:false,
             args:[
                 '--no-sandbox',
                     '--start-maximized',
                     '--disable-web-security',
                     '--disable-features=IsolateOrigins,site-per-process'
     
             ],
     
             timeout: 90000,
             defaultViewport: null
            } 
         })
         console.log("✅ Puppeteer Cluster inicializado correctamente");


    }catch(e){
        console.error("❌ Error al inicializar Puppeteer Cluster", e);
    }
    
};