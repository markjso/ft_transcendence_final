// SPDX-License-Identifier: MIT
pragma solidity >= 0.4.16 < 0.9.0;

contract ScoreStorage {
	struct tornamentScore {
        int id;
		string tName;
		string player1;
		int score1;
		string player2;
		int score2;
	}
	tornamentScore[] public scores;

	function addScore(int _id, string memory _tName, string memory _player1, int _score1, string memory _player2, int _score2) public {
		scores.push(tornamentScore(_id, _tName, _player1, _score1, _player2, _score2));
	}

	function getScore(int _id, string memory _tName, string memory _player1, string memory _player2) public view
        returns (int, string memory, string memory, int, string memory, int)
    {
        for (uint256 i = 0; i < scores.length; i++) {
            tornamentScore memory currentScore = scores[i];

            // Check if the current score matches the search criteria
            bool idMatch = (_id == 0 || currentScore.id == _id);
            bool tNameMatch = (bytes(_tName).length == 0 || keccak256(bytes(currentScore.tName)) == keccak256(bytes(_tName)));
            bool player1Match = (bytes(_player1).length == 0 || keccak256(bytes(currentScore.player1)) == keccak256(bytes(_player1)));
            bool player2Match = (bytes(_player2).length == 0 || keccak256(bytes(currentScore.player2)) == keccak256(bytes(_player2)));

            // Return the score if all specified conditions match
            if (idMatch && tNameMatch && player1Match && player2Match) {
                return (
                    currentScore.id,
                    currentScore.tName,
                    currentScore.player1,
                    currentScore.score1,
                    currentScore.player2,
                    currentScore.score2
                );
            }
        }
        // If no match found, revert with a message
        revert("Score not found with the given criteria.");
    }

	function getScoresLength() public view returns (uint256) {
		return scores.length;
	}
}
