const User = require("../models/User");
const auth = require("../auth");
const bcrypt = require("bcrypt")

// Utility function to validate email format


module.exports.registerUser = (req, res) => {
    if (!req.body.email.includes("@")){
        return res.status(400).send({error: 'Email invalid'});
    }
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({error: 'Mobile number invalid'});
    }
    else if (req.body.password.length < 8) {
        return res.status(400).send({error: 'Password must be atleast 8 characters'});
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'Registered Successfully'
        }))
        .catch(error => errorHandler(error, req, res));
    }
};

module.exports.loginUser = (req, res) => {
    if(req.body.email.includes('@')){
        return User.findOne({ email : req.body.email })
        .then(result => {
            if(result == null){
                return res.status(404).send({error: 'No Email found'});
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {
                    return res.status(200).send({ access : auth.createAccessToken(result)})
                } else {
                    return res.status(401).send({error: 'Email and password do not match'});
                }
            }
        })
        .catch(err => errorHandler(err, req, res));
    }else{
        return res.status(400).send({ error: 'Invalid email' });
    }
   
};

module.exports.getDetails = (req, res) => {
    return User.findById(req.user.id)
        .select('-password') // Exclude the password field
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }
            res.status(200).send({ user });
        })
        .catch(err => auth.errorHandler(err, req, res));
};
module.exports.setAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Set the user role to admin
        user.isAdmin = true;
        await user.save();

        return res.status(200).json({ updatedUser: user });
    } catch (error) {
        return res.status(500).json({ error: 'Failed in find', details: error });
    }
}

module.exports.updatePassword = async (req, res) => {
    const { newPassword } = req.body;

        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed in find', details: error });
        }
}

module.exports.updateProfile = async (req, res) => {
    const { firstName, lastName, email, mobileNo } = req.body;
    
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.mobileNo = mobileNo || user.mobileNo;
        
        await user.save();
        
        return res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update profile', details: error });
    }
};

module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName'); // Fetch only firstName and lastName
        if (users.length > 0) {
            return res.status(200).json({ users });
        } else {
            return res.status(404).json({ message: 'No users found' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};