const mongoose = require('mongoose'); 

const CompanyProfile = require("../models/companyProfile/companyProfile");

exports.updateCompanyProfile = async (_id, updateData) => {
    try {
       
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            throw new Error("Invalid ObjectId format");
        }

    
        
        const updatedProfile = await CompanyProfile.findByIdAndUpdate(_id, updateData, { new: true });

      
       
        if (!updatedProfile) {
            throw new Error("Profile not found");
        }

        return updatedProfile;
    } catch (error) {
        console.error(`Error updating profile: ${error.message}`);
        throw new Error("Error updating profile: " + error.message);
    }
};



exports.createCompanyProfile = async (profileData) => {
    try {
        // Create a new company profile instance
        const newProfile = new CompanyProfile(profileData);

        // Save the profile to the database
        const savedProfile = await newProfile.save();

        return savedProfile;
    } catch (error) {

        console.log(error , "error")
        console.error(`Error creating profile: ${error.message}`);
        throw new Error("Error creating profile: " + error.message);
    }
};