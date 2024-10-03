import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {


    const { fullname, email, username, password } = req.body;
    console.log("Email :", email);

    // if (fullname === "") {
    //     throw new ApiError(400, "Full Name cannot be empty");
    // }
    //Final code for Validation
    if (
        [
            fullname,
            email,
            username,
            password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(409, "All fields are required");
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.file?.avatar[0]?.path
    const coverImageLocalPath = req.file?.avatar[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(409, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(409, "Avatar file is not uploade");
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await user.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(409, "Something went wrong, User not created");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully", true),
    )

});


export { registerUser };




//      ----------------- Todo -------------------//
//  Get User details from Frontend

//  Validate Data Details before Submit to Server

//  Check user is already Registered or not - Username and Email

//  Check for Images, also for Avatar

//  Upload them to Cloudinary

//  Create user Object - Create entry in DB

//  Remove Password and RefreshToken from Response

//  Check user creation response

//  Return Response