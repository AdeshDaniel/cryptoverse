import React, { useState, useEffect } from "react";
import millify from "millify";
import { Collapse, Row, Col, Typography, Avatar } from "antd";
import HTMLReactParser from "html-react-parser";

import { useGetExchangesQuery } from "../services/cryptoApi";
import { baseUrl } from "../services/cryptoApi";
import Loader from "./Loader";

const { Text } = Typography;
const { Panel } = Collapse;

const Exchanges = () => {
  const { data, isFetching } = useGetExchangesQuery();
  const exchangesList = data?.data?.exchanges;
  const [exchangeDetails, setExchangeDetails] = useState(() => {
    const initialState = [];
    for (let i = 0; i < 50; i++) {
      initialState.push({ description: "Loading..." });
    }
    return initialState;
  });

  if (isFetching) return <Loader />;

  async function fetchExchangeDetails(exchangeId, index) {
    try {
      const res = await fetch(`${baseUrl}/exchange/${exchangeId}`);
      const { data } = await res.json();
      setExchangeDetails(
        exchangeDetails.map((item, i) =>
          i === index
            ? { ...item, description: data.exchange.description }
            : item
        )
      );
    } catch (err) {
      setExchangeDetails(
        exchangeDetails.map((item, i) =>
          i === index
            ? {
                ...item,
                description: "Error occurred, please try again later.",
              }
            : item
        )
      );
    }
  }

  return (
    <>
      <Row>
        <Col span={6}>Exchanges</Col>
        <Col span={6}>24h Trade Volume</Col>
        <Col span={6}>Markets</Col>
        <Col span={6}>Change</Col>
      </Row>
      <Row>
        {exchangesList?.map((exchange, i) => (
          <Col span={24}>
            <Collapse
              onChange={() => {
                fetchExchangeDetails(exchange.uuid, i);
              }}
            >
              <Panel
                key={exchange.uuid}
                showArrow={false}
                header={
                  <Row key={exchange.uuid}>
                    <Col span={6}>
                      <Text>
                        <strong>{exchange.rank}.</strong>
                      </Text>
                      <Avatar
                        className="exchange-image"
                        src={exchange.iconUrl}
                      />
                      <Text>
                        <strong>{exchange.name}</strong>
                      </Text>
                    </Col>
                    <Col span={6}>${millify(exchange["24hVolume"])}</Col>
                    <Col span={6}>{millify(exchange.numberOfMarkets)}</Col>
                    <Col span={6}>{millify(exchange.marketShare)}%</Col>
                  </Row>
                }
              >
                {exchangeDetails[i].description === "Loading..." ? (
                  <Loader />
                ) : (
                  HTMLReactParser(
                    exchangeDetails[i].description ||
                      "Information Not Available"
                  )
                )}
              </Panel>
            </Collapse>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Exchanges;
