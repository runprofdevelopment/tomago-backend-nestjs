const profile = {
    id: -1,
    avatar: '',
    name: 'Shamy Stores',
    email: 'codes@shamystores.com', 
    phoneNumber: '',
    type: 'shamy_store_app',
}

module.exports = class AppProfile {
    static get PROFILE() {
        return profile
    }
    static get ID() {
        return profile.id
    }
    static get TYPE() {
        return profile.type
    }
    static get NAME() {
        return profile.name
    }
    static get EMAIL() {
        return profile.email
    }
    static get AVATAR() {
        return profile.avatar
    }
    static get PHONE_NUMBER() {
        return profile.phoneNumber
    }
}