import React from 'react';

export default class Result extends React.Component {

  render(){
    if(this.props.state.voteResults === null){
      return 
    }
    let affSelectedSessionId = parseInt(this.props.state.selectedSessionId, 10)+1;
    if ((this.props.state.contractSessionId > this.props.state.selectedSessionId) || (this.props.state.currentStatus === 5)){
      return (
          <div>
            <div>
              <p>Résultat{affSelectedSessionId}</p>
                <p>{this.props.state.voteResults.winningProposalName}</p>
                <p>Votes : {this.props.state.voteResults.nbVotes} / {this.props.state.voteResults.totalVotes}</p>
            </div>
            <div></div>
          </div>
      );
    }
    else{
      return 
    }
  
  }
}

