export const actions = {
    default: async ( event: any ) => {
        const formData = Object.fromEntries(await event.request.formData());
        const building_id = formData['building_id'];
        const id = formData['id'];
        const first_name = formData['first_name'];
        const last_name = formData['last_name'];
        const dob = formData['dob'];
        const phone_number = formData['phone_number'];
        const email = formData['email'];

        const url = `https://api.trello.com/1/cards?idList=${process.env.RESIDENTS_QUEUE}&key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}&name=${first_name + ' ' + last_name + ' - ' + building_id}&desc=${'ID: ' + id + ' | ' + 'DOB: ' + dob + ' | ' + 'Phone Number: ' + phone_number + ' | ' + 'Email: ' + email}`;

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