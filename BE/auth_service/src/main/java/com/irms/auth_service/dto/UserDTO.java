package com.irms.auth_service.dto;

public class UserDTO {
    private Long userID;
    private String userName;
    private String password;
    private String permission;
    private String fullname;
    private String phone;
    private String email;

    public UserDTO() {}

    public UserDTO(Long userID, String userName, String password, String permission, String fullname, String phone, String email) {
        this.userID = userID;
        this.userName = userName;
        this.password = password;
        this.permission = permission;
        this.fullname = fullname;
        this.phone = phone;
        this.email = email;
    }

    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPermission() { return permission; }
    public void setPermission(String permission) { this.permission = permission; }

    public String getFullname() { return fullname; }
    public void setFullname(String fullname) { this.fullname = fullname; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}