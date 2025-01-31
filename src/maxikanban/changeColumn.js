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

const {createCard} = require('../maxikanban/createCard');
const {getProjectFieldDatas} = require('./getProjectFieldDatas');
const config = require('../../config.js');

const mutation = (projectId, itemId, fieldId, value) => `
  mutation {
    updateProjectNextItemField(
      input: {
        projectId: "${projectId}"
        itemId: "${itemId}"
        fieldId: "${fieldId}"
        value: "${value}"
      }
    ) {
      projectNextItem {
        id
        fieldValues(first: 10) {
          nodes {
            id
            value
          }
        }
      }
    }
  }
`;

module.exports.changeColumn = async (githubClient, issue, projectId, value) => {
  const fieldDatas = getProjectFieldDatas(issue);

  // In case the card doesn't have any column
  if (!fieldDatas) {
    await createCard(githubClient, config.maxiKanban.id, issue.repository.issue.id);

    return false;
  }

  // If it has a column, it can be moved because it's an update operation
  const datas = await githubClient.graphql(mutation(projectId, fieldDatas.itemId, fieldDatas.fieldId, value));

  return datas;
};
