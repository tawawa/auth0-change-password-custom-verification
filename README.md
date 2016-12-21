# What is it?

It provides a solution to customization of the Auth0 change password flow such that old password must be successfully entered
prior to accepting a new password. Furthermore, no password verification email is sent out with the change password update.


## Required Secrets

To run locally, just create a `.env` file in the base of the project, and provide the necessary values.

Here is an example:

```
AUTH0_DOMAIN=mytenant.auth0.com
AUTH0_CLIENT_ID=myClientID
AUTH0_CONNECTION_NAME=myConnectionName
AUTH0_MANAGEMENT_TOKEN=myManagementToent
```

The Client Id is the id of a Client you define in the Dashboard for your Auth0 Tenant with a Database Connection to the Connection
users shall be using to login with.

The Connection Name is the name of your DB Connection associated with the users logging in eg. Initial-Connection, DBConn etc

The Management Token needs to have `update user` privileges.

See [here](https://auth0.com/docs/api/management/v2#!/Users/patch_users_by_id) for details.

So the Management Token should have `update:user` and `update:users_app_metadata` scopes assigned.


## Running locally

With `.env` populated, simply do the following:

To run the sample extension locally:

```bash
$ npm install
$ npm start
```

## Deploying as Webtask 

Here, you need to create the Webtask and supply the secrets it will use to execute at Runtime.

Here, i run webtasks with several different profiles, so am particular about specifying my particular profile.

E.g/

```
wt create --name password-reset-custom-verification --profile demo-workshop-default build/bundle.js \
--secret AUTH0_DOMAIN="demo-workshop.auth0.com" \
--secret AUTH0_CLIENT_ID="K8g5hMEnxxxxxxxxTemvc1xPK7m" \
--secret AUTH0_CONNECTION_NAME="DBConnection" \
--secret AUTH0_MANAGEMENT_TOKEN="eyJhbGcxxxxxx.......xxxxxxxxxxj5jtDu3rrw" 
```

Once we have created the webtask, then run:

```bash
$ npm run deploy 
```

The webtask should now be running.

Go to:

Your webtask URL `/forgot` to initiate the flow.

eg. `https://demo-workshop.us.webtask.io/password-reset-custom-verification/forgot`


## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com/signup) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
