const getProductCode = async (apiKey: string, base64Image:any) => {
    try{
        const body = JSON.stringify({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
            {
                role: 'user',
                content: [
                { type: 'text', text: 'Extrae el product code del siguiente documento. devuelvelo en formato JSON' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                ]
            }
            ]
        });
    
        const url = 'https://api.openai.com/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body
        });
    
        const result = await response.json();
        const productCodeResult = JSON.parse(result.choices[0].message.content);
    
        return productCodeResult
    }
    catch(e: any){
        throw new Error(e.message)
    }
    
}

export {getProductCode} 