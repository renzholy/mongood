/* eslint-disable react/no-danger */

import React, { useMemo, useCallback } from 'react'
import {
  getTheme,
  Icon,
  CompoundButton,
  HoverCard,
  HoverCardType,
} from '@fluentui/react'
import _ from 'lodash'
import bytes from 'bytes'
import { EJSON } from 'bson'

import { ExecStats, MongoData } from '@/types'
import { Number } from '@/utils/formatter'
import { ColorizedData } from './ColorizedData'

export function ExecStage(props: { value: { [key: string]: MongoData } }) {
  const theme = getTheme()
  const value = useMemo<ExecStats>(
    () => EJSON.parse(JSON.stringify(props.value)) as ExecStats,
    [props.value],
  )
  const onRenderPlainCard = useCallback(() => {
    return (
      <div
        style={{
          padding: 10,
          maxWidth: 500,
          maxHeight: 500,
          overflowY: 'scroll',
          backgroundColor: theme.palette.neutralLighterAlt,
        }}>
        <ColorizedData
          value={_.omit(props.value, ['inputStage', 'inputStages'])}
        />
      </div>
    )
  }, [props.value])

  return (
    <>
      <HoverCard
        type={HoverCardType.plain}
        plainCardProps={{ onRenderPlainCard }}
        styles={{
          host: {
            display: 'inherit',
            cursor: 'pointer',
          },
        }}
        instantOpenOnClick={true}>
        <CompoundButton
          styles={{
            description: {
              whiteSpace: 'pre',
              lineHeight: '1.2em',
            },
            label: {
              whiteSpace: 'pre',
              lineHeight: '1.2em',
            },
            root: {
              paddingTop: 10,
              paddingBottom: 10,
              minHeight: 'unset',
              height: 'fit-content',
            },
          }}
          secondaryText={_.compact([
            `${Number.format(
              value.executionTimeMillisEstimate -
                (value.inputStage?.executionTimeMillisEstimate ||
                  Math.max(
                    value.inputStages?.[0].executionTimeMillisEstimate || 0,
                    value.inputStages?.[1].executionTimeMillisEstimate || 0,
                  ) ||
                  0),
            )} ms`,
            value.keysExamined === undefined
              ? undefined
              : `${Number.format(value.keysExamined)} keys examined`,
            value.docsExamined === undefined
              ? undefined
              : `${Number.format(value.docsExamined)} docs examined`,
            value.nMatched === undefined
              ? undefined
              : `${Number.format(value.nMatched)} matched`,
            value.memUsage === undefined
              ? undefined
              : `${bytes(value.memUsage, {
                  unitSeparator: ' ',
                }).toLocaleLowerCase()} mem used`,
            `${Number.format(value.nReturned)} returned`,
          ]).join('\n')}>
          {value.stage}
        </CompoundButton>
      </HoverCard>
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
          <ExecStage
            value={props.value.inputStage as { [key: string]: MongoData }}
          />
        </>
      ) : null}
      {props.value.inputStages ? (
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
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}>
            {(props.value.inputStages as { [key: string]: MongoData }[]).map(
              (inputStage, index) => (
                <div
                  key={index.toString()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                    marginTop: index === 0 ? 0 : 34,
                  }}>
                  <ExecStage value={inputStage} />
                </div>
              ),
            )}
          </div>
        </>
      ) : null}
    </>
  )
}
