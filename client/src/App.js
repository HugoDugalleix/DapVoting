import React, { Component } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3.js";
import Vote from "./assets/components/Vote.js"
import Result from "./assets/components/Result.js"

import "./App.css";


class App extends Component {
  state = { 
    web3: null, 
    accounts: null, 
    contract: null, 
    myEvents: null,
    isOwner: false,
    contractSessionId: null, 
    selectedSessionId: null,
    curState: null,
    resultSession: null,
    listVoters: [],
    listProposals: [],
    listProposalsRefused: [],
    listVotersHasVoted: [],
    voteResults: null,
  };

  componentDidMount = async () => {

    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();

      const deployedNetwork = VotingContract.networks[networkId];
      const contract = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      let isOwner = false;
      let myOwner = await contract.methods.owner().call();
      if(myOwner === accounts[0]){
        isOwner = true; 
      }

      let contractSessionId = parseInt(await contract.methods.sessionId().call(), 10);
      let selectedSessionId = contractSessionId;
      let currentStatus = parseInt(await contract.methods.currentStatus().call(), 10);

      this.setState({ web3, accounts, contract, isOwner, contractSessionId, selectedSessionId, currentStatus });  

      this.startFakeWebSocket();

    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  
  /* Les diffénrentes sessions */
  reduceSelectedSession = async () => {
    let { selectedSessionId } = this.state;    
    if (selectedSessionId > 0){
      selectedSessionId --;
      this._updateResultSession();
    }

    this.setState({ selectedSessionId });  
  };

  increaseSelectedSession = async () => {
    let { selectedSessionId, contractSessionId } = this.state;    
    if (selectedSessionId < contractSessionId){
      selectedSessionId ++;
      this._updateResultSession();
    }

    this.setState({ selectedSessionId });  
  };

  _updateResultSession = async () => {
    let { selectedSessionId, contract, contractSessionId, resultSession } = this.state; 

    if (selectedSessionId < contractSessionId) {
      resultSession = await contract.methods.sessions(selectedSessionId).call();
    }else{
      resultSession = null;
    }

    this.setState({ resultSession });  
    this.refresh();

    return 1;
  }
  
  /* L'actualisation */
  refresh = async () => {
    let { contract, contractSessionId, 
      currentStatus, selectedSessionId, 
      listVoters, listProposals, 
      listProposalsRefused, listVotersHasVoted, 
      voteResults } = this.state; 


    let context = this;

    listVoters = [];
    listProposals = [];
    listProposalsRefused = []; 
    listVotersHasVoted = [];

    contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function(error, events){ })
    .then(function(myEvents){
      for(let myEvent of myEvents){
        if ( parseInt(myEvent.returnValues.sessionId, 10) === selectedSessionId ) {
          if (myEvent.event === 'VoterRegistered'){
            addToList(listVoters, 
              { 
                key: myEvent.returnValues.voterAddress, 
                isAbleToPropose: myEvent.returnValues.isAbleToPropose
              }
            );
          }
          if (myEvent.event === 'VoterUnRegistered'){
            removeToList(listVoters, myEvent.returnValues.voterAddress);
          }     
          if (myEvent.event === 'ProposalRegistered'){
            addToList(listProposals, 
              { 
                key: myEvent.returnValues.owner, 
                idToSend: myEvent.returnValues.proposalId, 
                content: myEvent.returnValues.proposal
              }
            );
          }          
          if (myEvent.event === 'ProposalUnRegistered'){
            removeToList(listProposals, myEvent.returnValues.owner);
            addToList(listProposalsRefused, 
              { 
                key: myEvent.returnValues.owner, 
                idToSend: myEvent.returnValues.proposalId, 
                content: myEvent.returnValues.proposal
              }
            );            
          }            

          if (myEvent.event === 'Voted'){
            addToList(listVotersHasVoted, 
              { 
                key: myEvent.returnValues.voter, 
                idVoted: myEvent.returnValues.proposalId, 
              }
            );            
          }   

        }
      }
      context.setState({ listVoters, listProposals, listVotersHasVoted, listProposalsRefused});  
    });

    contractSessionId = parseInt(await contract.methods.sessionId().call(), 10);
    currentStatus = parseInt(await contract.methods.currentStatus().call(), 10);

    if ((currentStatus === 5) || (contractSessionId !== selectedSessionId)) {
      voteResults = await contract.methods.getSessionResult(selectedSessionId).call();
    }

    this.setState({ contractSessionId, currentStatus, voteResults });
  };

  goToNewSession = async () => {
    let { selectedSessionId } = this.state; 
    selectedSessionId ++;
    this.setState({ selectedSessionId });
    this.refresh();
  };

  startFakeWebSocket = async () => {
    setInterval(this.refresh, 1000);
  };


  render() {
    if (!this.state.web3) {
      return (
        <div>Chargement..</div>
      );
    }
    return (
      <div className="App">

        <Vote state={this.state}/>
        <Result state={this.state}/>
      </div>
    );
  }
};


export default App;