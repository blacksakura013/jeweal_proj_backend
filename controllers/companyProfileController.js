const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const profileService = require("../services/companyProfileService");
const CompanyProfile = require('../models/companyProfile/companyProfile');

exports.updateCompanyProfile = async (req, reply) => {
    try {
       
                const parts = req.parts(); 
                let fileData;
                const formData = {};

           
        
                for await (const part of parts) {
                    if (part.file) {
                     
                        const uploadPath = path.join(__dirname, '..', 'uploads', part.filename);
                        await fs.promises.writeFile(uploadPath, await part.toBuffer());
                        fileData = `/uploads/${part.filename}`;
                    } else {
                        if(part.fieldname === "image_logo_url" ){
                            fileData=part.value;
                        } 
                      
                        formData[part.fieldname] = part.value;
                    }
                }
        
                const {
                    country, city, state_province, website, currency, address,
                    postcode, email, phone, company_name, contact_person,
                    mailing_name, official_address, tax_id, branch_code
                } = formData;

                
        
                // if (!fileData) {
                //     return reply.status(400).send({ error: "Image file is required" });
                // }
        
                if (!country || !city || !state_province || !currency || !address || !postcode || !email || !phone || !company_name || !contact_person || !mailing_name || !official_address || !tax_id || ( official_address ==="head_office" ? branch_code  : !branch_code)) {
                    return reply.status(400).send({ error: "Missing required fields" });
                }
        
                const updateData = {
                    country: JSON.parse(formData.country),
                    city: JSON.parse(formData.city),
                    state_province: JSON.parse(formData.state_province),
                    website: formData.website,
                    currency: formData.currency,
                    address: formData.address,
                    image_logo_url: fileData,
                    postcode: formData.postcode,
                    email: formData.email,
                    phone: formData.phone,
                    company_name: formData.company_name,
                    contact_person: formData.contact_person,
                    mailing_name: formData.mailing_name,
                    official_address: formData.official_address,
                    tax_id: formData.tax_id,
                    branch_code: formData.branch_code,
                 
                };
        
             
            
        

        const updatedProfile = await profileService.updateCompanyProfile(formData._id, updateData);

        
        reply.status(200).send(updatedProfile);
    } catch (error) {
        console.error(`Error in updateProfileController: ${error.message}`);
        reply.status(500).send({ error: 'Error updating profile' });
    }
};

exports.createCompanyProfile = async (req, reply) => {
    try {
        const parts = req.parts(); 
        let fileData;
        const formData = {};

        for await (const part of parts) {
            if (part.file) {

                const uploadPath = path.join(__dirname, '..', 'uploads', part.filename);
                await fs.promises.writeFile(uploadPath, await part.toBuffer());
                fileData = `/uploads/${part.filename}`;
            } else {

                formData[part.fieldname] = part.value;
            }
        }

        const {
            country, city, state_province, website, currency, address,
            postcode, email, phone, company_name, contact_person,
            mailing_name, official_address, tax_id, branch_code
        } = formData;

        // if (!fileData) {
        //     return reply.status(400).send({ error: "Image file is required" });
        // }

        if (!country || !city || !state_province || !currency || !address || !postcode || !email || !phone || !company_name || !contact_person || !mailing_name || !official_address || !tax_id || ( official_address ==="head_office" ? branch_code  : !branch_code)) {
            return reply.status(400).send({ error: "Missing required fields" });
        }

        const createProfile = await profileService.createCompanyProfile({
            country: JSON.parse(formData.country),
            city: JSON.parse(formData.city),
            state_province: JSON.parse(formData.state_province),
            website: formData.website,
            currency: formData.currency,
            address: formData.address,
            image_logo_url: fileData,
            postcode: formData.postcode,
            email: formData.email,
            phone: formData.phone,
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            mailing_name: formData.mailing_name,
            official_address: formData.official_address,
            tax_id: formData.tax_id,
            branch_code: formData.branch_code,
           
        });

        reply.status(200).send(createProfile);
    } catch (error) {
        console.error(`Error in createCompanyProfile: ${error.message}`);
        reply.status(500).send({ error: "Error creating profile" });
    }
};

exports.getCompanyProfile = async (req, reply) => {
    try {
        const companyProfile = await CompanyProfile.findOne(); // Get the first document

        if (!companyProfile) {
            return reply.status(200).send({ error: 'Profile not found' ,key:"notFound"});
        }

        reply.status(200).send(companyProfile);
    } catch (error) {
        console.error(`Error retrieving profile: ${error.message}`);
        reply.status(500).send({ error: 'Error retrieving profile' });
    }
};
