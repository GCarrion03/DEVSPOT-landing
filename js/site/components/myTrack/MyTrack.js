import { DevspotBase, Role } from '/js/site/commons/DevspotBase.js';
import { fetchFromPost, fetchFromDelete, fetchFromPut } from "/js/site/commons/HttpUtils.js";
import { constants } from "/js/site/siteConstants.js";
import { paymentModal, renderPaypalButtons } from "/js/site/components/paymentModal/PaymentModal.js";
import { DateUtils } from "/js/site/commons/DateUtils.js";
import { generateCertificate, CredentialType } from "/js/site/components/certificateGenerator/certificateGenerator.js";
class MyTrack extends DevspotBase {
    constants;
    exam;
    myTrackData;
    componentRoot = (document.body.querySelector('my-track'));
    constructor() {
        super();
    }

    async connectedCallback() {
        this.constants = (await import('/js/site/siteConstants.js')).constants;
        this.userRole = await this.getAssignedUserRole(this.getAttribute("examId"));
        let body = {"examId": this.getAttribute("examId"), "userId": this.userData?.username, "userRole": this.userRole};
        this.exam = await fetchFromPost(this.constants.myTrackEndpoint, body);
        this.myTrackData = this.exam.myTrackData;
        let htmlToExportToPDF =`<div style="text-align: center;">
                                    <h2>${this.exam.examId} - ${this.exam.examName}</h2></div>
                                    <div style="text-align: center;"><h4>From: https://devspot.org/${this.exam.examId}.html</h4></div>`;
        const numberIncorrect = this.myTrackData.filter(e => e.status === 'incorrect').length;
        const numberCorrect = this.myTrackData.filter(e => e.status === 'correct').length;
        const numberAnswered = this.myTrackData.filter(e => e.status !== 'notRequested').length;
        const numberNotRequested = this.myTrackData.filter(e => e.status === 'notRequested').length;
        const completedScore = (numberCorrect / numberAnswered);

        let mytrack = `<div class="col-sm-12 padding-bottom-md padding-sides-0" >
                <div class="col-md-2 col-sm-3 legendText padding-sides-0 text-align-center bold">Overall Score:</div>
                <div class="col-md-2 col-sm-3 padding-sides-0 text-align-center basicTooltip bold" >
                    ${(numberCorrect * 100 / this.exam.totalNumberOfQuestions).toFixed(2)}%
                    <span class="basicTooltipText">Get your this score above 80% to pass your exam and get your certificate, guaranteed!<br></span>
                </div>
                <div class="col-md-2 col-sm-3 legendText padding-sides-0 text-align-center bold" >Completed:</div>
                <div class="col-md-2 col-sm-3 padding-sides-0 text-align-center basicTooltip bold" >
                    ${(numberAnswered * 100 / this.exam.totalNumberOfQuestions).toFixed(2)}%
                    <span class="basicTooltipText">"My Track" completion percentage.<br></span>
                </div>
                <div class="col-md-2 col-sm-3 legendText padding-sides-0 text-align-center bold" >Completed Score:</div>
                <div class="col-md-2 col-sm-3 padding-sides-0 text-align-center basicTooltip bold ${completedScore >= 0.72 ? 'lightGreen': 'lightRed'}" >
                    ${(100 * numberCorrect / numberAnswered).toFixed(2)}%
                    <span class="basicTooltipText">My Completed Track score. This score must be higher than 72% to pass.<br></span>
                </div>
                <div class="col-md-2 col-sm-3 legendText padding-sides-0 text-align-center bold">Error ratio:</div>
                <div class="col-md-2 col-sm-3 padding-sides-0 text-align-center basicTooltip bold ${numberIncorrect / numberCorrect <= 0.3 ? 'lightGreen': 'lightRed'}" >
                    ${numberCorrect === 0 ? '---' : ( numberIncorrect / numberCorrect).toFixed(2)}
                    <span class="basicTooltipText">The sum of incorrect answers divided by the sum of correct answers. A good error ratio is around 0.3<br></span>
                </div>
                <div class="col-md-2 col-sm-3 legendText padding-sides-0">Questions:</div>
                <div class="col-md-2 col-sm-3 padding-sides-0 text-align-center bold">${this.exam.totalNumberOfQuestions}</div>
                <div class="col-md-2 col-sm-3 legendText padding-sides-0">Answered:</div>
                <div class="col-md-2 col-sm-3 padding-sides-0 text-align-center bold">${(this.myTrackData.filter(e => e.status !== 'notRequested').length)}</div>
                <div class="col-md-2 col-sm-3 legendText padding-sides-0">Correct:</div>
                <div class="col-md-2 col-sm-3 userAnswer padding-sides-0 darkGreen">${(this.myTrackData.filter(e => e.status === 'correct').length)}</div>
                <div class="col-md-2 col-sm-3 legendText padding-sides-0 ">Incorrect:</div>
                <div class="col-md-2 col-sm-3 userAnswer padding-sides-0 darkRed">${(this.myTrackData.filter(e => e.status === 'incorrect').length)}</div>
                <div class="col-md-2 col-sm-3 legendText padding-sides-0">Not yet answered:</div>
                <div class="col-md-2 col-sm-3 userAnswer padding-sides-0 darkBlue">${(this.myTrackData.filter(e => e.status === 'notRequested').length)}</div>
                </div>`;
        this.myTrackData.forEach(userAnswer => {
            let correctAnswerText = '';
            if (userAnswer?.questionAnswer?.length < 2) {
                const correctOption = userAnswer.questionOptions.find(x => x.optionId === userAnswer.questionAnswer);
                correctAnswerText += correctOption?.optionId + ' - ' + correctOption?.optionText;
            } else {
                userAnswer?.questionAnswer?.split('').forEach(ans => {
                    const correctOption = userAnswer.questionOptions.find(x => x.optionId === ans);
                    correctAnswerText += correctOption?.optionId + ' - ' + correctOption?.optionText + ' '
                });
            }
            let userAnswerText = '';
            if (userAnswer?.userQuestionAnswer) {
                if (userAnswer?.userQuestionAnswer?.length < 2) {
                    userAnswerText += userAnswer.questionOptions.find(x => x.optionId === userAnswer.userQuestionAnswer)?.optionText
                } else {
                    userAnswer?.userQuestionAnswer?.split('').forEach(ans => userAnswerText += userAnswer.questionOptions.find(x => x.optionId === ans)?.optionText + ' ');
                }
            } else {
                userAnswerText = 'Not answered!';
            }
                let tooltipText = (userAnswer.status !== 'notRequested') ?
                `<span class="basicTooltipText displayTooltipCenter">
                    <strong>Question: </strong>${userAnswer.questionText}<br>
                    <strong>Correct Answer: </strong>  ${correctAnswerText}
                    ${userAnswer.status === 'incorrect' ? '<br><strong>Your Answer: </strong>' + userAnswerText : ''}
                </span>`
                : this.userData?.username ? '<span class="basicTooltipText displayTooltipCenter">Not registered yet!</span>' : '<span class="basicTooltipText displayTooltipCenter">Sign In to track your progress! </span>';
            let answerColor = '';
            switch (userAnswer.status) {
                case 'incorrect':
                    answerColor = 'darkRed';
                    break;
                case 'correct':
                    answerColor = 'darkGreen';
                    break;
                case 'notRequested':
                    answerColor = 'darkBlue';
                    break;
            }
            mytrack += `<div class="col-md-1 col-xs-2 userAnswer basicTooltip padding-sides-0 ${answerColor}">${userAnswer.questionSkId} ${tooltipText}</div>`
            if (this.userRole === Role.CONTRIBUTOR) {
                htmlToExportToPDF += `<p><strong>Question ${userAnswer.questionSkId}: </strong>${userAnswer.questionText}<br>`;
                userAnswer.questionOptions?.forEach(x => htmlToExportToPDF += `<strong>Option ${x.optionId}: </strong>${x.optionText}<br>`);
                htmlToExportToPDF += `<strong>Your Answer: </strong>${userAnswerText}<br>`;
                htmlToExportToPDF += `<strong>Correct Answer: </strong>${correctAnswerText}</p>`;
            }
        });
        const div = document.createElement('div');
        div.id = "tmpDiv";
        div.innerHTML =
            `<template id="practiceTest-styles">
                <link href="/layout/styles/layout.css" rel="stylesheet" type="text/css" media="all">
                <link href="/css/bootstrap.css" rel="stylesheet">
                <link href="/css/style.css" rel="stylesheet" type="text/css">
                <link rel="stylesheet" type="text/css" href="/css/roboto_light/stylesheet.css">
                <div class="section-title">
                ${paymentModal}
                    <span class="caption d-block small">My Track</span>
                    <h3>${this.exam.examId}</h3>
                    <div class="col-lg-12 padding-sides-0">
                        
                        <div class="col-md-6 padding-sides-0 watermarked ${this.userRole === Role.CONTRIBUTOR ? 'watermarked-contributor' : 'watermarked-free'}">
                            <img src="/images/logo/avail/${this.exam.badgeFile}" class="cert-cred">
                        </div>
                        <div class="col-md-6 text-align-center padding-sides-0">
                            ${this.userRole === Role.USER ? `
                                <button id="btnContribute" type="button" class="btn stdButton basicTooltip white-space-normal mdMinWidth" data-toggle="modal" data-target="#myModal"><i class="fa fa-credit-card-alt"> Get Contributor Access to unlock the features below</i><span class="col-sm-1 basicTooltipText" style="left: -15px;"> Also you will have access to all our contributor features!<br></span></button>
                            ` : ''}
                            <button type="button" class="btn stdButton basicTooltip mdMinWidth" id="deleteBtn" ${this.userRole === Role.CONTRIBUTOR ? '' : 'disabled'}>
                                <i class="fa fa-trash"> Delete all "My Track" data</i>
                                <span class="col-sm-1 basicTooltipText" style="left: -15px;">
                                    Warning! this will remove all your saved questions on the ${this.exam.examId} track.<br>
                                </span>
                            </button>
                            <button type="button" class="btn stdButton basicTooltip mdMinWidth" id="downloadBtn" 
                                ${this.userRole === Role.CONTRIBUTOR ? '' : 'disabled'}>
                                <i class="fa fa-download"> Download Question Database</i>
                                <span class="col-sm-1 basicTooltipText" style="left: -15px;">
                                    Download all ${this.exam.examId} exam questions as PDF.<br>
                                </span>
                            </button>
                            <button type="button" class="btn stdButton basicTooltip mdMinWidth" id="pdfMyTrackBtn"
                                ${(numberCorrect * 100 / this.exam.totalNumberOfQuestions).toFixed(2) > 80 ? '' : 'disabled'}>
                                <i class="fa fa-file-pdf-o"> Track completion certificate</i>
                                <span class="col-sm-1 basicTooltipText" style="left: -15px;">
                                    Complete your track to download and share on LinkedIn your achievement!<br>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="userAnswersContainer" style="min-height: 400px;">
                        ${mytrack}
                </div>
             </template>`;
        this.componentRoot.append(div);
        const template = this.componentRoot.querySelector(`#practiceTest-styles`);
        const node = document.importNode(template.content, true);
        this.componentRoot.innerHTML='';
        this.componentRoot.appendChild(node);
        if (this.userRole === Role.USER) {
            this.renderPaypal();
        } else {
            if (this.userRole === Role.CONTRIBUTOR) {
                this.componentRoot.querySelector(`#deleteBtn`).onclick = async () => {
                    var r = confirm(`All ${this.exam.examId} saved "My Track" Data will be lost\nAre you sure?`);
                    if (r) {
                        let body = {"examId": this.getAttribute("examId"), "userId": this.userData?.username};
                        this.exam = await fetchFromDelete(this.constants.myTrackEndpoint, body);
                        window.location.reload();
                    }
                };

                this.componentRoot.querySelector(`#downloadBtn`).onclick = async () => {

                    var specialElementHandlers = {
                        '#editor': function (element, renderer) {
                            return true;
                        }
                    };

                    const doc = new jsPDF();

                    htmlToExportToPDF = htmlToExportToPDF.replace(/\n|\t/g, ' ');
                    doc.fromHTML(htmlToExportToPDF, 10, 10, {
                        'width': 170,
                        'elementHandlers': specialElementHandlers
                    });
                    doc.save(`${this.exam.examId}.pdf`);
                }
            }
        }
        if ((numberCorrect * 100 / this.exam.totalNumberOfQuestions).toFixed(2) >= 80) {
            this.componentRoot.querySelector(`#pdfMyTrackBtn`).onclick = () => {
                this.downloadCertificate();
            }
        }
    };

    async renderPaypal(){
        (await import(`https://www.paypal.com/sdk/js?client-id=${constants.paypalClientId}&currency=USD`));
        let onApproveRerenderCallback = (details) => {
            document.querySelector('#btnClosePopup').click();
            window.location.reload();
        };
        if (this.userRole !== Role.VISITOR) {
            renderPaypalButtons(onApproveRerenderCallback, this.userData.username, this.exam.examId);
        }
    };

    downloadCertificate() {
            let date = new Date();
            const issueDate = DateUtils.getDateMMMDDYYYY(date);
            date = date.setFullYear(new Date().getFullYear() + 3);
            const expiryDate = DateUtils.getDateMMMDDYYYY(date);
            generateCertificate(CredentialType.MYTRACK, this.userData?.username, this.exam.examId, this.exam.examName, issueDate,
                expiryDate, this.exam.providerAcronym, this.examGUID, `https://devspot.org/${this.exam.examId}.html?credId=${this.examGUID}`);
            const body = [
                {
                    userId: this.userData.username,
                    credId: this.examGUID,
                    examId: this.exam.examId,
                    credType: CredentialType.EXAM.name}];
            fetchFromPut(constants.credentialEndpoint, body).then();

    }
}
customElements.define('my-track', MyTrack);