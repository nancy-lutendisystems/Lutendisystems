export const actions = {
    default: async ( event: any ) => {
        const formData = Object.fromEntries(await event.request.formData());
        const type = formData['type'];
        const text = formData['text'];  
        const email = formData['email'];

        const url = `https://api.trello.com/1/cards?idList=${process.env.SUPPORT_QUEUE}&key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}&name=${type + ': ' + email}&desc=${text}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                }
            })
    
            const result = await response.status;
            return {
                status: result
            };
        } catch (error) {
            return {
                status: 500
            };
        }
    }
};