import React from 'react';
import Status from './Status.js';
import StatusDisplay from "./Status.js"

export default class Vote extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notice: ''
    };
  }

  addProposal = async () => {
    if(this.newPropal.value.trim() !== '')
    {    
      const { accounts, contract, web3 } = this.props.state;
      await contract.methods.addProposal(this.newPropal.value).send({ from: accounts[0] },
        async (erreur, tx) => {
          if(tx){
            await web3.eth.getTransactionReceipt(tx, 
              async (erreur, receipt) => {
                if(receipt.status){
                  this.setState({notice: 'Proposition ajoutée'});
                  setTimeout(() => this.setState({notice: ''}), 5000);
                  this.newPropal.value = "";
                }
              }
            )
          }
        }
      );
    }
  };

  addVote = async (idToVote) => {
    const { accounts, contract, web3 } = this.props.state;
    await contract.methods.addVote(idToVote).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){
                this.setState({notice: 'Vote enregistré'});
                setTimeout(() => this.setState({notice: ''}), 5000);
              }
            }
          )
        }
      }
    );  
  };

  render(){
    let hasProposed = isInList(this.props.state.listProposals, this.props.state.accounts[0]);
    let isRefused = isInList(this.props.state.listProposalsRefused, this.props.state.accounts[0]);
    let hasVoted = isInList(this.props.state.listVotersHasVoted, this.props.state.accounts[0]);
    let indexVoter = this.props.state.listVoters.findIndex(x => x.key === this.props.state.accounts[0]);
    let isAbleToPropose = false;
    if(indexVoter !== -1) {
      isAbleToPropose = this.props.state.listVoters[indexVoter].isAbleToPropose;
    } else {
      isAbleToPropose = false;
    }
    
    if(this.props.state.contractSessionId === this.props.state.selectedSessionId){

      if(isInList(this.props.state.listVoters, this.props.state.accounts[0]))
      {
          return (
          <div>
          <div ></div>
          <div >
          <div >
            <h2>Voteur</h2>
            <Status state={this.props.state} userType="Voter"/>
            
            <div>
              {(this.props.state.currentStatus === 1 && !hasProposed && isAbleToPropose) &&
               
                <form >
                  <label >
                    <textarea 
                      ref={(input) => { 
                        this.newPropal = input
                      }}
                      placeholder="Écrivez votre proposition"                    
                    />
                    
                  <input type="button" value="Valider" onClick= { this.addProposal } />            
                  </label>
                </form>
             
              }

              {(this.props.state.currentStatus === 1 && hasProposed && isAbleToPropose) &&
                <h3 className="text-success"> Votre proposition est bien envoyée </h3>
              }

              {(this.props.state.currentStatus === 1 && !isAbleToPropose) &&
                <h3 className="text-danger"> Vous n'êtes pas autorisé à faire de proposition ! </h3>
              }

              {(this.props.state.currentStatus === 2 && hasProposed && !isRefused) &&
                <h3  className="text-warning"> Propositon en cours d'étude </h3>
              }
             
              {(this.props.state.currentStatus === 2 && isRefused) &&
                <h3 className="text-danger"> Votre proposition a été refusée </h3>
              }

              {(this.props.state.currentStatus === 3 && this.props.state.listProposals.length > 0 && !hasVoted) &&
                <div>
                  <h3> Liste des propositions </h3>
                  {this.props.state.listProposals.map((propal) => (
                    <div key={propal.key}> {parseInt(propal.idToSend,10)+1} - {propal.content}
                      <input type="button" value="Voter" onClick= { () => this.addVote(propal.idToSend)}/>
                    </div>
                    ))   
                  }
                </div>
              }
              {(this.props.state.currentStatus === 3 && hasVoted) &&
                <h3 className="text-success"> Votre vote a bien été pris en compte </h3>
              }
            </div>       
              {this.state.notice !== '' &&
                <div className="notices">{this.state.notice}</div>
              }
            </div>
            <div></div>
          </div>
          </div>
        );
      }
      if(!this.props.state.isOwner) {
        return (<div>
          <div>En attente..</div>
          </div>);
      } else {
        return (<div></div>);
      }
    }
    else{
      return (<div></div>);
    }
  }
}