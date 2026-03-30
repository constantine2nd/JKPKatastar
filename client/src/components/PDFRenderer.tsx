import React from "react";
import {
  Page,
  Text,
  Image,
  Document,
  StyleSheet,
  View,
  Font,
  Link,
} from "@react-pdf/renderer";
import { Grave } from "../interfaces/GraveIntefaces";
import { dateFormatter } from "../utils/dateFormatter";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
    padding: 32,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 12,
  },
  mapContainer: {
    marginTop: 12,
    marginBottom: 12,
    width: "100%",
    height: 300,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  link: {
    fontSize: 10,
    color: "#1976d2",
    textAlign: "center",
    marginTop: 8,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

interface PDFRendererProps {
  grave: Grave;
  mapImageUrl: string;
}

const PDFFile: React.FC<PDFRendererProps> = ({ grave, mapImageUrl }) => {
  const currentURL = window.location.href;
  return (
    <Document>
      <Page style={styles.page} orientation="portrait">
        <Text style={styles.title}>Podaci o grobnom mestu</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Groblje</Text>
            <Text style={styles.value}>{grave?.cemetery?.name ?? "-"}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Tip grobnog mesta</Text>
            <Text style={styles.value}>{grave?.graveType?.name ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Broj</Text>
            <Text style={styles.value}>{grave?.number ?? "-"}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Polje</Text>
            <Text style={styles.value}>{grave?.field ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Red</Text>
            <Text style={styles.value}>{grave?.row ?? "-"}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Kapacitet</Text>
            <Text style={styles.value}>{grave?.graveType?.capacity ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>LAT</Text>
            <Text style={styles.value}>{grave?.LAT ?? "-"}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>LON</Text>
            <Text style={styles.value}>{grave?.LON ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Datum isteka ugovora</Text>
            <Text style={styles.value}>{dateFormatter(grave?.contractTo)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.mapContainer}>
          <Image style={styles.mapImage} src={mapImageUrl} />
        </View>

        <Link style={styles.link} src={currentURL}>
          {currentURL}
        </Link>

        <Text
          fixed
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        />
      </Page>
    </Document>
  );
};

export default PDFFile;
