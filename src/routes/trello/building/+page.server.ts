export const actions = {
    default: async ( event: any ) => {
        const formData = Object.fromEntries(await event.request.formData());
        const company_id = formData['company_id'];
        const alias = formData['alias'];
        const building_id = formData['building_id'];
        const street = formData['street'];
        const city = formData['city'];
        const province = formData['province'];
        const postal_code = formData['postal_code'];

        const url = `https://api.trello.com/1/cards?idList=${process.env.BUILDINGS_QUEUE}&key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}&name=${alias + ' - ' + building_id}&desc=${'Company ID: ' + company_id + ' | ' + 'Address: ' + street + ' ' +  city + ', ' + province + ' ' + postal_code}`;

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