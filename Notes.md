transporter is used to commicate with smtp server which is used in email handling.

ledger will maintain the history like account has transfer the money to account b and b has received it .(how much is money is credited to account and how much money is debited is maintain by ledger).

four steps of transaction :-
1. we create a transaction consisits of account a , account b , amount - how much is deducted ,idompotent key(unique string to avoid repititon of payemnt) , status - pending (transfer the money of a to b)
2. money is deducted from a - ledger maintain it
3. money is added to account to b - leedger maintain it 
4. change the status pending to complete. 

how to cheak current balance ?
ledger maintain the history we add all the credit balance and minus all the debited balance that give the current balance 
we never hardcore save the balance of user in database, we use the ledger system to calculate this
