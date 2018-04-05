var keystone = require('keystone'),
	Account = keystone.list('Account');
var axios = require('axios');

exports.testapi = function(req, res) {
	Account.model.findOne({accountId: req.query.accountId}).exec(function(err,acc){
		if(err){
			throw err;
			return res.status(422).json({message: 'Error'});
		}
		if(acc){
			axios.get('https://api.linkedin.com/v1/people/~?oauth2_access_token='+acc.accessToken+'&format=json')
			  .then(function (response) {
			    console.log(response.data);
		    	return res.status(200).json({
		            success: true,
		            data: response.data
		        });
			  })
			  .catch(function (error) {
			    console.log(error);
				return res.status(422).json({message: 'Error'});
			  });
		}
		else{
			console.log("Accont does not exist");
			return res.status(200).json({
		        success: true,
		        message: "Accont does not exist",
		        data: null
		    });

		}
	})
}
