import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppDeployBadge from '@/components/AppDeployBadge.vue'
import DeploymentStatus from '@/constants/deployment-status'

describe('AppDeployBadge', () => {
  it('renders the label for a success status', () => {
    const wrapper = mount(AppDeployBadge, { props: { status: DeploymentStatus.SUCCESS } })
    expect(wrapper.text()).toContain('Success')
  })

  it('renders the label for a failed status', () => {
    const wrapper = mount(AppDeployBadge, { props: { status: DeploymentStatus.FAILED } })
    expect(wrapper.text()).toContain('Failed')
  })

  it('renders the label for a deploying status', () => {
    const wrapper = mount(AppDeployBadge, { props: { status: DeploymentStatus.DEPLOYING } })
    expect(wrapper.text()).toContain('Deploying')
  })
})
