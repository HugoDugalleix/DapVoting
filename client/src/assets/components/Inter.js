import React from 'react';
import StatusDisplay from "./Status.js"

export default class Inter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notice: '',
      isAbbleToPropose: true,
    };
  }

  addVoter = async () => {
    const { accounts, contract, web3 } = this.props.state;
    const { isAbbleToPropose } = this.state;  
    if(this.newVoter.value.trim() !== '')
    {
      await contract.methods.addVoter(this.newVoter.value, isAbbleToPropose).send({ from: accounts[0] },
        async (erreur, tx) => {
          if(tx){
            await web3.eth.getTransactionReceipt(tx, 
              async (erreur, receipt) => {
                if(receipt.status){
                  this.setState({notice: 'Electeur ajouté'});
                  setTimeout(() => this.setState({notice: ''}), 5000);
                  this.newVoter.value = "";
                  this.setState({isAbbleToPropose: true});
                }
              }
            )
          }
        }
      );   
    }
  };

  removeVoter = async (addressToKill) => {
    const { accounts, contract, web3 } = this.props.state;
    await contract.methods.removeVoter(addressToKill).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){
                this.setState({notice: 'Electeur supprimé'});
                setTimeout(() => this.setState({notice: ''}), 5000);
              }
            }
          )
        }
      }
    );  
  };

  removeProposal = async (idToKill) => {
    const { accounts, contract, web3 } = this.props.state;
    await contract.methods.removeProposal(idToKill).send({ from: accounts[0] },
      async (erreur, tx) => {
        if(tx){
          await web3.eth.getTransactionReceipt(tx, 
            async (erreur, receipt) => {
              if(receipt.status){
                this.setState({notice: 'Proposition supprimé'});
                setTimeout(() => this.setState({notice: ''}), 5000);
              }
            }
          )
        }
      }
    );  
  };

  handleInputChange = (event) => {
    const isAbbleToPropose = event.target.checked;
    this.setState({isAbbleToPropose});
  };

  render(){
    if(this.props.state.isOwner && (this.props.state.contractSessionId === this.props.state.selectedSessionId))
    {
      return (
        <div>
          <div></div>
          <div>
            <div>
              <h2 >Interface administrateur</h2>        
              <Status
                state={this.props.state} userType="Admin"
                goToNewSession={() => this.props.goToNewSession()}
              />
            <div className="formulaires">
              {this.props.state.currentStatus === 0 &&
                <form>
                  <label>
                      <label>Ajouter l'adresse d'un voteur</label>
                      <input type="text" id="newVoter" 
                        ref={(input) => { 
                          this.newVoter = input
                        }}
                      />
                    <input
                      name="isAbbleToPropose"
                      type="checkbox"
                      checked={this.state.isAbbleToPropose}
                      onChange={this.handleInputChange} />
                  </label>
                  <input type="button" value="Ajouter" onClick= { () => this.addVoter() } />            
                </form>
              }
            </div>       
              {this.state.notice !== '' &&
                <div className="notices">{this.state.notice}</div>
              }
              <h3> Liste des voteurs </h3>
              {this.props.state.listVoters.length > 0 
              ?
                this.props.state.listVoters.map((voter) => (
                  <div className="m-2" key={voter.key}> {voter.key}
                  {voter.isAbleToPropose 
                  && <img className="m-2" src="logo.png" width="25" height="25" alt="able_to_propose"/>
                  }
                  {this.props.state.currentStatus === 0 && <input type="button" className="btn btn-danger ml-2" value="Retirer" onClick= { () => this.removeVoter(voter.key) } />}
                  </div>
                ))           
              : 
              <div>Pas de voteurs</div>
              }       
              <h2> Propositions</h2>
              {this.props.state.listProposals.length > 0 
              ?
                this.props.state.listProposals.map((propal) => (
                  <div key={propal.key}> {parseInt(propal.idToSend,10)+1} - {propal.content}
                  {this.props.state.currentStatus === 2 && <input type="button" value="Retirer" onClick= { () => this.removeProposal(propal.idToSend) } />}
                  </div>
                ))           
              : 
              <div>Pas de propositions</div>
              }       
              <h3> Propositions refusées</h3>
              {this.props.state.listProposalsRefused.length > 0 
              ?
                this.props.state.listProposalsRefused.map((propal) => (
                  <div key={propal.key}> {parseInt(propal.idToSend,10)+1} - {propal.content}
                  </div>
                ))           
              : 
              <div >Pas de propositions refusée.</div>
              }    
            </div>
          </div>
        </div>
      );
    }
    else{
      return (<div></div>);
    }
    
  }
}
