'use strict';
//import { tenantDB } from './tenantManagementDB.js';

const tenantSearchButton = document.getElementById('tenantSearchButton');
const tenantSearch = document.getElementById('tenantSearch');

const newTenantPopUp = document.querySelector('.newTenantComponent');
const newTenantForm = document.querySelector('.newTenantForm');
const tenantTable = document.querySelector('.tenantTable');

const deleteTenantButton = document.getElementById('deleteTenantButton');

const sortByName = document.getElementById('sortTableName');
const sortLicenceDESC = document.getElementById('sortTableLicences0');
const sortLicenceASC = document.getElementById('sortTableLicences1');

///////////////-Delete tenant data dev easter egg-/////////////////////////////
const deleteTableDataButton = document.getElementById('deleteTableButton');
document
  .getElementById('deleteTenantTableEasterEgg')
  .addEventListener('click', () => {
    deleteTableDataButton.hidden = false;
  });
deleteTableDataButton.addEventListener('click', function () {
  clearTable();
  localStorage.clear();
});
///////////////////////////////////////////////////////////////////////////
let database = [];

const localStorageData = JSON.parse(localStorage.getItem('tenantDB'));

const storeTenantDB = () => {
  localStorage.setItem('tenantDB', JSON.stringify(database));
};

newTenantBtn.addEventListener('click', (e) => {
  e.preventDefault();
  newTenantPopUp.hidden = false;
});

const clearTable = () => {
  document.querySelector('.tableBody').replaceChildren();
};

newTenantForm.addEventListener('submit', (e) => {
  e.preventDefault();
  setNewTenant();
});

const setNewTenant = () => {
  const tenantFormData = new FormData(newTenantForm);

  const newTenantObject = new Object();
  let newTenantUuid = crypto.randomUUID();

  newTenantObject.id = newTenantUuid;

  newTenantObject.name = tenantFormData.get('name');

  newTenantObject.licenses = Number(tenantFormData.get('licenses'));

  database.push(newTenantObject);
  storeTenantDB();
  renderTenantTable(database);
  newTenantForm.reset();
  newTenantPopUp.hidden = true;
};

sortByName.addEventListener('click', function () {
  sortingTenants((a, b) => {
    if (a.name < b.name) {
      return -1;
    } else {
      return 1;
    }
  });
});

sortLicenceDESC.addEventListener('click', function () {
  sortingTenants((a, b) => b.licenses - a.licenses);
});

sortLicenceASC.addEventListener('click', function () {
  sortingTenants((a, b) => a.licenses - b.licenses);
});

const sortingTenants = (sort) => {
  localStorageData.sort(sort);
  localStorage.setItem('tenantDB', JSON.stringify(localStorageData));
  window.location.reload();
};

const paginationTenantTable = function (tenantsPerPage, currentPage) {
  const paginationPages = document.getElementById('pagination');
  const displayedTenants = new Array();
  paginationPages.replaceChildren('');

  for (let i = 0; i < localStorageData.length / 5; i++) {
    const displayedPages = i + 1;
    const page = document.createElement('a');
    page.innerHTML = ` ${displayedPages} `;
    page.classList.add('pageCounting');
    page.setAttribute('id', `page${i}`);
    paginationPages.appendChild(page);
    currentPageButton(page);
  }
localStorageData.map(tenant => localStorageData.indexOf(tenant))


  document.getElementById(`page${currentPage - 1}`).style.color = 'red';
  document.getElementById(`page${currentPage - 1}`).style.fontSize = 'large';

  for (let i = 0; i < localStorageData.length; i++) {
    if (
      i >= (currentPage - 1) * tenantsPerPage &&
      i < tenantsPerPage * currentPage
    ) {
      displayedTenants.push(localStorageData[i]);

      renderTenantTable(displayedTenants);
    }
  }
};

const currentPageButton = function (thisPage) {
  thisPage.addEventListener('click', function () {
    return paginationTenantTable(5, Number(thisPage.innerHTML));
  });
};

const editTenant = (row, tenant) => {
  row.deleteCell(2);

  const editLicenseCell = row.insertCell(2);

  const licenseInput = document.createElement('input');
  editLicenseCell.appendChild(licenseInput);
  licenseInput.setAttribute('type', 'number');
  licenseInput.setAttribute('value', tenant.licenses);
  licenseInput.classList.add('editLicenceInput');
  licenseInput.addEventListener('click', (e) => e.stopPropagation());

  const editButton = document.createElement('button');
  editButton.classList.add('editLicencesButton');
  editLicenseCell.appendChild(editButton);
  editButton.innerHTML = 'Edit';
  editButton.addEventListener('click', (e) => {
    e.stopPropagation();
    setLicences(licenseInput.value, localStorageData.indexOf(tenant));
  });
};

const setLicences = (licences, tenant) => {
  database[tenant].licenses = licences;

  storeTenantDB();
  renderTenantTable(localStorageData);
};

const deleteTenant = () => {
  document.querySelectorAll('.tableRow.clicked').forEach((selectedRow) => {
    const tenantIndex = database.findIndex(
      (tenant) => tenant.id === selectedRow.id
    );

    database.splice(tenantIndex, 1);
    storeTenantDB();
    renderTenantTable(database);
  });
};

deleteTenantButton.addEventListener('click', (e) => {
  e.preventDefault();
  deleteTenant();
});

const renderTenantTable = (localStorageData) => {
  clearTable();
  localStorageData.forEach((tenant, i) => {
    renderRow(tenant, i);
  });
};

const renderRow = (tenant, i) => {
  const row = document.querySelector('.tableBody').insertRow(-1);
  row.classList.add('tableRow');
  row.setAttribute('id', tenant.id);

  const idCell = row.insertCell(0);
  const nameCell = row.insertCell(1);
  const licencesCell = row.insertCell(2);

  idCell.innerHTML = tenant.id;
  nameCell.innerHTML = tenant.name;
  licencesCell.innerHTML = tenant.licenses;

  selectedTenant(tenant, row, i);
};

const selectedTenant = (tenant, row, i) => {
  row.addEventListener('click', (e) => {
    editTenant(e.target.closest('tr'), localStorageData[i]);

    if (row.classList.contains('clicked')) {
      row.classList.remove('clicked');
      row.cells[2].replaceChildren(`${tenant.licenses}`);
      //deleteTenantButton.hidden = true;
    } else {
      row.classList.add('clicked');
      deleteTenantButton.hidden = false;
    }
  });
};

const searchTenant = () => {
  const tenantResult = database.filter(
    (tenant) =>
      tenantSearch.value === tenant.id || tenantSearch.value === tenant.name
  );

  renderTenantTable(tenantResult);
};

tenantSearchButton.addEventListener('click', () => searchTenant());

const init = () => {
  if (localStorageData) database.push(...localStorageData);
  else database.push(...tenantDB);
  storeTenantDB();
  renderTenantTable(database);
  paginationTenantTable(5, 1);
};

window.onload = init();
