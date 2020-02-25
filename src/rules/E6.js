/**
 * 2007-2018 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2018 PrestaShop SA
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */
const Rule = require('./Rule.js');

module.exports = class E6 extends Rule {

    /**
     * @param {Context} context
     *
     * @public
     */
    async apply(context) {
        const pullRequestId = context.payload.pull_request.number;

        const referencedIssuesIds = await this.pullRequestDataProvider.getReferencedIssues(
            pullRequestId,
            context.payload.repository.owner.login,
            context.payload.repository.name
        );

        if (referencedIssuesIds.length > 0) {
            for (const referencedIssueId of referencedIssuesIds) {
                this.logger.info(`[Rule Applier] E6 - Re-open issue ${referencedIssueId}`);

                await this.githubApiClient.issues.update({
                    issue_number: referencedIssueId,
                    owner: context.payload.repository.owner.login,
                    repo: context.payload.repository.name,
                    state: 'open'
                });

                const referencedIssue = await this.issueDataProvider.getData(
                    referencedIssueId,
                    context.payload.repository.owner.login,
                    context.payload.repository.name
                );
                // Remove automatic labels
                this.removeIssueAutomaticLabels(
                    referencedIssue,
                    context.payload.repository.owner.login,
                    context.payload.repository.name
                );

                await this.moveCardTo(referencedIssueId, this.config.kanbanColumns.toBeReviewedColumnId);
            }
        }
    }
};