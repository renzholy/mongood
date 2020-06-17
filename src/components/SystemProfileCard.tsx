/* eslint-disable react/no-danger */

import React, { useEffect, useState, useMemo } from 'react'
import { Card } from '@uifabric/react-cards'
import {
  Text,
  getTheme,
  Icon,
  TooltipHost,
  CompoundButton,
} from '@fluentui/react'
import _ from 'lodash'

import { SystemProfileDoc, ExecStats } from '@/types'
import { stringify } from '@/utils/mongo-shell-data'
import { colorize } from '@/utils/editor'
import { useDarkMode } from '@/utils/theme'

function ExecStage(props: { value: ExecStats }) {
  const theme = getTheme()
  const isDarkMode = useDarkMode()
  const str = useMemo(() => stringify(_.omit(props.value, 'inputStage'), 2), [
    props.value,
  ])
  const [html, setHtml] = useState(str)
  useEffect(() => {
    colorize(str, isDarkMode).then(setHtml)
  }, [str, isDarkMode])

  return (
    <>
      <TooltipHost
        content={<pre dangerouslySetInnerHTML={{ __html: html }} />}
        tooltipProps={{ maxWidth: null }}>
        <CompoundButton
          styles={{
            description: { whiteSpace: 'pre-wrap', lineHeight: '1.2em' },
            root: {
              paddingTop: 10,
              paddingBottom: 10,
              minHeight: 'unset',
            },
          }}
          secondaryText={_.compact([
            `${
              props.value.executionTimeMillisEstimate -
              (props.value.inputStage?.executionTimeMillisEstimate || 0)
            } ms`,
            `${props.value.nReturned} returned`,
            props.value.docsExamined === undefined
              ? undefined
              : `${props.value.docsExamined} docs examined`,
            props.value.keysExamined === undefined
              ? undefined
              : `${props.value.keysExamined} keys examined`,
            props.value.memUsage === undefined
              ? undefined
              : `${props.value.memUsage} mem usage`,
          ]).join('\n')}>
          {props.value.stage}
        </CompoundButton>
      </TooltipHost>
      {props.value.inputStage ? (
        <>
          <Icon
            iconName="Forward"
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                margin: 8,
              },
            }}
          />
          <ExecStage value={props.value.inputStage} />
        </>
      ) : null}
    </>
  )
}

export function SystemProfileCard(props: { value: SystemProfileDoc }) {
  const theme = getTheme()

  return (
    <Card
      styles={{
        root: {
          backgroundColor: theme.palette.neutralLighterAlt,
          marginBottom: 10,
        },
      }}
      tokens={{
        childrenGap: 10,
        padding: 20,
        minWidth: 600,
        maxWidth: 'unset',
        minHeight: 'unset',
      }}>
      <Card.Item>
        <Text
          variant="xLarge"
          styles={{ root: { color: theme.palette.neutralPrimary } }}>
          {props.value.ns}
        </Text>
      </Card.Item>
      <Card.Item>
        <Text
          variant="large"
          styles={{ root: { color: theme.palette.neutralSecondary } }}>
          {props.value.nreturned}&nbsp;returned,&nbsp;
          {props.value.millis}&nbsp;ms
        </Text>
      </Card.Item>
      <Card.Item
        styles={{
          root: {
            display: 'flex',
            flexDirection: 'row-reverse',
            flexWrap: 'wrap',
            width: 'fit-content',
          },
        }}>
        {props.value.execStats ? (
          <ExecStage value={props.value.execStats} />
        ) : null}
      </Card.Item>
    </Card>
  )
}
