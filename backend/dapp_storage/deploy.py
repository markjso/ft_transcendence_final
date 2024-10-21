import os
import json
from web3 import Web3
from solcx import compile_standard, install_solc
from django.core.exceptions import ObjectDoesNotExist
from .models import DeployedContract  # Assuming you have a model to store the contract address

class DeployContract():
    w3 = None
    contract = None

    def __init__(self):
        # Connect to Ganache
        host = os.getenv('GANACHE_HOST')
        port = os.getenv('GANACHE_PORT')
        self.w3 = Web3(Web3.HTTPProvider(f"http://{host}:{port}"))

    def load_abi(self):
        # Load ABI from the scoreStorage.json file
        with open("./dapp_storage/json/scoreStorage.json", "r") as file:
            compiled_sol = json.load(file)
        abi = compiled_sol["contracts"]["scoreStorage.sol"]["ScoreStorage"]["abi"]
        return abi

    def get_stored_contract(self):
        try:
            # Get the stored contract address from the database
            contract_data = DeployedContract.objects.get(name="ScoreStorage")
            print(f"the address from get stored {contract_data.address}")
            return contract_data.address
        except ObjectDoesNotExist:
            return None

    def save_contract_address(self, address):
        # Check if a DeployedContract with name="ScoreStorage" exists, or create a new one
        contract_data, created = DeployedContract.objects.get_or_create(
            name="ScoreStorage",
            defaults={'address': address}
        )

        if not created:
            # If the contract already exists, update the address
            contract_data.address = address
            contract_data.save()

    def deploy(self):
        if self.contract is None:
            # Check if contract address is already stored in the database
            contract_address = self.get_stored_contract()
            if contract_address:
                abi = self.load_abi()  # Load ABI from saved JSON file
                self.contract = self.w3.eth.contract(address=contract_address, abi=abi)
                return

            # If no contract is stored, proceed with deployment
            with open("./dapp_storage/contract/scoreStorage.sol", "r") as file:
                score_storage_file = file.read()

            # Compile the contract
            install_solc("0.6.0")
            compiled_sol = compile_standard(
                {
                    "language": "Solidity",
                    "sources": {"scoreStorage.sol": {"content": score_storage_file}},
                    "settings": {
                        "outputSelection": {
                            "*": {
                                "*": ["abi", "metadata", "evm.bytecode", "evm.bytecode.sourceMap"]
                            }
                        }
                    },
                },
                solc_version="0.6.0",
            )

            # Save compiled data to JSON
            with open("./dapp_storage/json/scoreStorage.json", "w") as file:
                json.dump(compiled_sol, file)

            # Extract bytecode and ABI
            bytecode = compiled_sol["contracts"]["scoreStorage.sol"]["ScoreStorage"]["evm"]["bytecode"]["object"]
            abi = compiled_sol["contracts"]["scoreStorage.sol"]["ScoreStorage"]["abi"]

            # Setup contract deployment
            my_address = os.getenv('GANACHE_USER')
            private_key = os.getenv('GANACHE_PRIVATE_KEY')
            chain_id = 1337

            # Create the contract in Python and build the transaction
            ScoreStorage = self.w3.eth.contract(abi=abi, bytecode=bytecode)
            nonce = self.w3.eth.get_transaction_count(my_address, 'pending')
            transaction = ScoreStorage.constructor().build_transaction(
                {
                    "chainId": chain_id,
                    "gasPrice": self.w3.eth.gas_price,
                    "from": my_address,
                    "nonce": nonce,
                }
            )

            # Sign and send the transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key=private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"Done! Contract deployed to {tx_receipt.contractAddress}")

            # Store contract address in the database)
            self.save_contract_address(tx_receipt.contractAddress)

            # Set contract object for future interactions
            self.contract = self.w3.eth.contract(address=tx_receipt.contractAddress, abi=abi)

    def add_score(self, tournament_id, tournament_name, player1, score1, player2, score2):
        account = self.w3.eth.accounts[0]
        tx_hash = self.contract.functions.addScore(
            tournament_id,
            tournament_name,
            player1,
            score1,
            player2,
            score2
        ).transact({ 'from': account })
        self.w3.eth.wait_for_transaction_receipt(tx_hash)
        tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        tx_hash_hex = self.w3.to_hex(tx_hash)
        return tx_hash_hex

    def get_score(self, tournament_id, tournament_name, player1, player2):
        """
        This method interacts with the deployed contract to retrieve the score.
        """
        score_from_contract = self.contract.functions.getScore(
            tournament_id, tournament_name, player1, player2
        ).call()

        return score_from_contract
