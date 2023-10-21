import React, { useState, useEffect, useRef } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import axios from "axios";
import { Modal, Form, Row, Col, Button, Table } from "react-bootstrap";
import ButtonMUI from '@mui/material/Button';

import { dateFormatter } from "../utils/dateFormatter";
import {
  selectAllGraves,
  fetchGraves,
  getGravesStatus,
  getGravesError,
  deleteSingleGrave,
} from "../features/gravesSlice";
import "./GraveTableScreen.css";
import { GraveData } from "../interfaces/GraveIntefaces";
import Loader from "../components/Loader";
import Message from "../components/Message";

// MUI Table
import { styled } from '@mui/material/styles';
import TableMUI from '@mui/material/Table';
import TableBodyMUI from '@mui/material/TableBody';
import TableCellMUI, { tableCellClasses } from '@mui/material/TableCell';
import TableContainerMUI from '@mui/material/TableContainer';
import TableHeadMUI from '@mui/material/TableHead';
import TableRowMUI from '@mui/material/TableRow';
import PaperMUI from '@mui/material/Paper';

// MUI Data Grid
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

const getRowStyling = (
  capacity: string,
  numberOfDeceaseds: string,
  contractTo: string
) => {
  let classString: string = "";
  let contractDate = new Date(contractTo);
  let contractDatePlus = new Date(contractTo);
  contractDatePlus.setMonth(contractDatePlus.getMonth() - 3);
  let today = new Date();
  if (Number(capacity) - Number(numberOfDeceaseds) === 0)
    classString += "capacity-row";
  if (today > contractDate) {
    classString += " contract-finished-row";
  } else if (today > contractDatePlus)
    classString += " contract-about-to-finish-row";

  return classString;
};

const GravesTableScreen: React.FC = () => {
  //const [graves, setGraves] = useState<GraveData[]>([]);
  let navigate = useNavigate();
  const graves: GraveData[] = useSelector(selectAllGraves);
  const gravesStatus = useSelector(getGravesStatus);
  const error = useSelector(getGravesError);
  const dispatch = useDispatch<any>();
  const [showModal, setShowModal] = useState(false);
  const [selectedGraveId, setSelectedGraveId] = useState<string>();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (gravesStatus === "idle") {
      console.log("UPAO");
      dispatch(fetchGraves());
    }
  }, [gravesStatus, dispatch]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGraveId("");
  };

  const handleShowModal = (id: string) => {
    setSelectedGraveId(id);
    setShowModal(true);
  };

  const handleDeleteGrave = () => {
    if (selectedGraveId) {
      dispatch(deleteSingleGrave(selectedGraveId));
      setShowModal(false);
    }
  };

  if (gravesStatus === "loading") {
    return <Loader />;
  }

  if (gravesStatus === "failed") {
    return (
      <Message variant="danger">
        <div>Error: {error}</div>
      </Message>
    );
  }

  const StyledTableCell = styled(TableCellMUI)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#1976d2',
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRowMUI)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));


  // Data Grid MUI
  const columns: GridColDef[] = [
    { field: 'number', headerName: t("number"), type: 'number'},
    { field: '_id', headerName: 'ID', type: 'number'},
    { field: 'field', headerName: t("field"), type: 'number'},
    { field: 'row', headerName: t("row"), type: 'number'},
    { field: 'capacity', headerName: t("capacity"), type: 'number'},
    { field: 'numberOfDeceaseds', headerName: t("numberOfDeceaseds"), type: 'number'},
    { field: 'LAT', headerName: t("LAT"), type: 'string'},
    { field: 'LON', headerName: t("LON"), type: 'string'},
  ];
  function getRowId(row: { _id: any; }) {
    return row._id;
  }
  

  return (
    <>
      <div
        style={{
          height: "50vw",
          width: "100%",
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>{t("graves-table-screen")}</div>
        <br />
        <Button
          onClick={() => {
            navigate({
              pathname: "/add-grave",
            });
          }}
        >
          {t("add grave")}
        </Button>
        <br />
        {graves.length !== 0 && (
          <Table
            striped
            bordered
            hover
            style={{
              width: "70%",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "red",
                }}
              >
                <th>#</th>
                <th>{t("number")}</th>
                <th>{t("field")}</th>
                <th>{t("row")}</th>
                <th>{t("capacity")}</th>
                <th>{t("occupation")}</th>
                <th>{t("contract-expiration-date")}</th>
                <th>LAT</th>
                <th>LON</th>
                <th>#</th>
                <th>#</th>
              </tr>
            </thead>
            <tbody>
              {graves.map((grave, index) => (
                <tr
                  key={index}
                  className={getRowStyling(
                    grave.capacity,
                    grave.numberOfDeceaseds,
                    grave.contractTo
                  )}
                >
                  <td>{index + 1}</td>
                  <td>{grave.number}</td>
                  <td>{grave.field}</td>
                  <td>{grave.row}</td>
                  <td>{grave.capacity}</td>
                  <td>{grave.numberOfDeceaseds}</td>
                  <td>{dateFormatter(grave.contractTo)}</td>
                  <td>{grave.LAT}</td>
                  <td>{grave.LON}</td>
                  <td>
                    <Button
                      onClick={() => {
                        navigate({
                          pathname: "/single-grave",
                          search: createSearchParams({
                            id: grave._id,
                          }).toString(),
                        });
                      }}
                    >
                      {t("details")}
                    </Button>
                  </td>
                  <td>
                    <Button onClick={() => handleShowModal(grave._id)}>
                      {t("delete")}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <div>
        <TableContainerMUI component={PaperMUI}>
          <TableMUI sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHeadMUI>
              <TableRowMUI>
                <StyledTableCell>#</StyledTableCell>
                <StyledTableCell>{t("number")}</StyledTableCell>
                <StyledTableCell align="right">{t("field")}</StyledTableCell>
                <StyledTableCell align="right">{t("row")}</StyledTableCell>
                <StyledTableCell align="right">{t("capacity")}</StyledTableCell>
                <StyledTableCell align="right">{t("occupation")}</StyledTableCell>
                <StyledTableCell align="right">{t("contract-expiration-date")}</StyledTableCell>
                <StyledTableCell align="right">LAT</StyledTableCell>
                <StyledTableCell align="right">LON</StyledTableCell>
                <StyledTableCell align="right">#</StyledTableCell>
                <StyledTableCell align="right">#</StyledTableCell>
              </TableRowMUI >
            </TableHeadMUI >
            <TableBodyMUI >
              {graves.map((grave, index) => (
                <StyledTableRow key={index + 1}>
                  <StyledTableCell component="th" scope="row">{index + 1}</StyledTableCell>
                  <StyledTableCell align="right">{grave.number}</StyledTableCell>
                  <StyledTableCell align="right">{grave.field}</StyledTableCell>
                  <StyledTableCell align="right">{grave.row}</StyledTableCell>
                  <StyledTableCell align="right">{grave.capacity}</StyledTableCell>

                  <StyledTableCell align="right">{grave.numberOfDeceaseds}</StyledTableCell>
                  <StyledTableCell align="right">{dateFormatter(grave.contractTo)}</StyledTableCell>
                  <StyledTableCell align="right">{grave.LAT}</StyledTableCell>
                  <StyledTableCell align="right">{grave.LON}</StyledTableCell>
                  <StyledTableCell align="right">
                    <ButtonMUI variant="contained" 
                        onClick={() => {
                          navigate({
                            pathname: "/single-grave",
                            search: createSearchParams({
                              id: grave._id,
                            }).toString(),
                          });
                        }}
                      >
                        {t("details")}
                      </ButtonMUI>
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <ButtonMUI variant="contained" color="secondary" onClick={() => handleShowModal(grave._id)}>
                      {t("delete")}
                    </ButtonMUI>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBodyMUI>
          </TableMUI>
        </TableContainerMUI>

        </div>
        <br />
        <div style={{ height: 400}}>
          <DataGrid getRowId={getRowId}
            rows={graves}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 3 },
              },
            }}
            pageSizeOptions={[3, 10]}
            checkboxSelection
          />
        </div>
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Brisanje grobnog mesta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Da li ste sigurni da zelite da izbrisete grobno mesto?
        </Modal.Body>
        <Modal.Footer>
          <ButtonMUI color="secondary" onClick={handleCloseModal}>
            Nazad
          </ButtonMUI>
          <ButtonMUI color="primary" onClick={handleDeleteGrave}>
            Da
          </ButtonMUI>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GravesTableScreen;
