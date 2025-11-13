## To Do

- Input Filters
- Service Manager
- Session Manager
- Authentication
- Integrate view engine
- View Helpers
- Forms elements
- Controller Plugins
    * [ ] FlashMessenger
    * [ ] Layout
    * [ ] Params
    * [ ] Redirect
    * [ ] Url
    * [ ] BasePlugin

## Doing

- Plugin Manager

## Waiting


## Done

- IP Validation. Validate IP address input (A9 - 2017 OWASP top 10)
    > Increasing the application's security
    * [x] Validate IP4 address
    * [x] Validate IP6 address
- InArray validation. Validate the input value included within the array (A9 - 2017 OWASP top 10)
    > Increasing the application's security
    * [x] Validate event input
- Integer validation. Validate integer  value input (A9 - 2017 OWASP top 10)
    > Increasing the application's security
- Countermeasure to  brute force attack (A2 - 2017 OWASP top 10)
    > Increasing the application's security
    * [x] Rate limit
    * [x] Create a blocklist table. Columns in table: email, event, identifier, and timestamp (unix time).
    * [x] After 10 failed attempts, add the IP to the table of blocked IPs. The IP is blocked for 5 minutes. After that, if the validation code is still good, the client can try again.
- Remove the Morgan package
