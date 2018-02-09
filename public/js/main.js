$( document ).ready(function() {
    // axios.defaults.headers.common['Authorization'] = 'Bearer ' . ;
    $('#changePersonal').on('submit', (e) => {
        e.preventDefault();
        let data = $(e.currentTarget).serializeArray();

        loginUser('/edit', {
            data: data
        })
        .then(function (response) {
            debugger;
            if (response.data.success) {
                toastr.success(response.data.message,  {timeOut: 5000});
            } else {
                toastr.warning(response.data.message,  {timeOut: 5000});
            }

        })
        .catch(function (error) {
            toastr.error('Something wrong.',  {timeOut: 5000});
            debugger;
        });
    });


    function loginUser(url, data) {
        return axios.post(url, data);
    }
});